import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { parse } from 'csv-parse';
import { SurveyResult } from './models/SurveyResult';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import mysql from 'mysql2/promise';
import { Request, Response } from 'express';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'leadership',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// In-memory survey results placeholder
const surveyResults: SurveyResult[] = [];

// 전체 설문 결과 조회 (필터 지원)
app.get('/api/results', (req: any, res: any) => {
  let results = surveyResults;
  const { principle, team, startDate, endDate } = req.query;

  if (principle) {
    results = results.filter(r => r.principle === principle);
  }
  if (team) {
    results = results.filter(r => r.team === team);
  }
  if (startDate) {
    const sd = new Date(startDate as string);
    results = results.filter(r => new Date(r.date) >= sd);
  }
  if (endDate) {
    const ed = new Date(endDate as string);
    results = results.filter(r => new Date(r.date) <= ed);
  }

  res.json(results);
});

// CSV 업로드 및 데이터 파싱
app.post('/api/results/upload', upload.single('file'), (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: '파일이 없습니다.' });
  const filePath = req.file.path;
  const parsed: SurveyResult[] = [];

  fs.createReadStream(filePath)
    .pipe(parse({ columns: true, trim: true }))
    .on('data', (row: Record<string, string>) => {
      const result: SurveyResult = {
        principle: row.principle,
        score: Number(row.score),
        date: row.date,
        team: row.team,
        userId: row.userId || undefined,
      };
      parsed.push(result);
    })
    .on('end', () => {
      surveyResults.push(...parsed);
      fs.unlinkSync(filePath);
      res.json({ message: '업로드 성공', count: parsed.length });
    })
    .on('error', (err: Error) => res.status(500).json({ error: err.message }));
});

// 원칙별 평균 점수 집계
app.get('/api/results/aggregated', (req: any, res: any) => {
  const summary: Record<string, { average: number; count: number }> = {};

  surveyResults.forEach(r => {
    if (!summary[r.principle]) summary[r.principle] = { average: 0, count: 0 };
    summary[r.principle].average += r.score;
    summary[r.principle].count += 1;
  });

  const aggregated = Object.entries(summary).map(([principle, data]) => ({
    principle,
    average: data.average / data.count,
    count: data.count,
  }));

  res.json(aggregated);
});

// Excel 리포트 다운로드 엔드포인트
app.get('/api/results/report/excel', async (req: any, res: any) => {
  const summary: Record<string, { average: number; count: number }> = {};
  surveyResults.forEach(r => {
    if (!summary[r.principle]) summary[r.principle] = { average: 0, count: 0 };
    summary[r.principle].average += r.score;
    summary[r.principle].count += 1;
  });
  const aggregated = Object.entries(summary).map(([principle, data]) => ({ principle, average: data.average / data.count, count: data.count }));

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Report');
  sheet.columns = [
    { header: '리더십 원칙', key: 'principle', width: 30 },
    { header: '평균 점수', key: 'average', width: 15 },
    { header: '응답 수', key: 'count', width: 10 },
  ];
  aggregated.forEach(item => sheet.addRow(item));
  res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.set('Content-Disposition', 'attachment; filename="report.xlsx"');
  const buffer = await workbook.xlsx.writeBuffer();
  res.send(buffer);
});

// PDF 리포트 다운로드 엔드포인트
app.get('/api/results/report/pdf', (req: any, res: any) => {
  const summary: Record<string, { average: number; count: number }> = {};
  surveyResults.forEach(r => {
    if (!summary[r.principle]) summary[r.principle] = { average: 0, count: 0 };
    summary[r.principle].average += r.score;
    summary[r.principle].count += 1;
  });
  const aggregated = Object.entries(summary).map(([principle, data]) => ({ principle, average: data.average / data.count, count: data.count }));

  const doc = new PDFDocument();
  res.set('Content-Type', 'application/pdf');
  res.set('Content-Disposition', 'attachment; filename="report.pdf"');
  doc.pipe(res);
  doc.fontSize(18).text('리더십 원칙 보고서', { align: 'center' });
  doc.moveDown();
  aggregated.forEach(item => {
    doc.fontSize(12).text(`${item.principle}: 평균 ${item.average.toFixed(2)}, 응답 수 ${item.count}`);
  });
  doc.end();
});

// Replace in-memory time-series with DB query
app.get('/api/time-series', async (req: any, res: any) => {
  const { period, targetId } = req.query;
  let query = `
    SELECT survey_year, survey_quarter, AVG(CAST(response_value AS UNSIGNED)) AS avg_score
    FROM survey_response_flat
    WHERE evaluation_type IN ('상사', '부하')
  `;
  const params: any[] = [];
  if (period) {
    query += ' AND CONCAT(survey_year, "-Q", survey_quarter) = ?';
    params.push(period);
  }
  if (targetId) {
    query += ' AND target_id = ?';
    params.push(targetId);
  }
  query += ' GROUP BY survey_year, survey_quarter ORDER BY survey_year, survey_quarter';
  const [rows]: any[] = await pool.query(query, params);
  const timeSeries = rows.map((r: any) => ({
    quarter: `${r.survey_year}-Q${r.survey_quarter}`,
    score: Number(r.avg_score)
  }));
  res.json(timeSeries);
});

// Replace principle-scores endpoint with DB query
app.get('/api/principle-scores', async (req: any, res: any) => {
  const { period, targetId } = req.query;
  let query = `
    SELECT question_text AS principle, AVG(CAST(response_value AS UNSIGNED)) AS avg_score
    FROM survey_response_flat
    WHERE evaluation_type IN ('상사', '부하')
  `;
  const params: any[] = [];
  if (period) {
    query += ' AND CONCAT(survey_year, "-Q", survey_quarter) = ?';
    params.push(period);
  }
  if (targetId) {
    query += ' AND target_id = ?';
    params.push(targetId);
  }
  query += ' GROUP BY question_no, question_text';
  query += ' ORDER BY question_no';
  const [rows]: any[] = await pool.query(query, params);
  const principleScores = rows.map((r: any) => ({
    principle: r.principle,
    name: r.principle,
    score: Number(r.avg_score)
  }));
  res.json(principleScores);
});

// Replace distribution endpoint with DB query
app.get('/api/distribution', async (req: any, res: any) => {
  try {
    const { period, targetId } = req.query;
    let query = `
      SELECT response_value AS score, COUNT(*) AS count
      FROM survey_response_flat
      WHERE evaluation_type IN ('상사', '부하')
    `;
    const params: any[] = [];
    if (period) {
      query += ' AND CONCAT(survey_year, "-Q", survey_quarter) = ?';
      params.push(period);
    }
    if (targetId) {
      query += ' AND target_id = ?';
      params.push(targetId);
    }
    query += ' GROUP BY response_value';
    const [rows]: any[] = await pool.query(query, params);
    const labels: Record<number, string> = {
      1: '미흡(1점)',
      2: '개선필요(2점)',
      3: '양호(3점)',
      4: '우수(4점)',
      5: '탁월(5점)'
    };
    const distribution = rows.map((r: any) => ({
      name: labels[r.score] || `${r.score}점`,
      value: r.count
    })).sort(
      (a: { name: string; value: number }, b: { name: string; value: number }) => {
        const aNum = Number(a.name.match(/\d+/)?.[0] ?? '0');
        const bNum = Number(b.name.match(/\d+/)?.[0] ?? '0');
        return aNum - bNum;
      }
    );
    res.json(distribution || []);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: 'DB 조회 오류', details: err.message });
      return;
    } else {
      res.status(500).json({ error: 'DB 조회 오류', details: String(err) });
      return;
    }
  }
});

// Replace comparison endpoint with DB query
app.get('/api/comparison', async (req: any, res: any) => {
  try {
    const { period, targetId } = req.query;

    let query = `
      SELECT 
             question_no,
             question_text AS principle,
             AVG(CASE WHEN evaluation_type = '본인' AND target_id = respondent_id${targetId ? ' AND target_id = ?' : ''} THEN CAST(response_value AS UNSIGNED) ELSE NULL END) AS self,
             AVG(CASE WHEN evaluation_type = '상사'${targetId ? ' AND target_id = ?' : ''} THEN CAST(response_value AS UNSIGNED) ELSE NULL END) AS manager,
             AVG(CASE WHEN evaluation_type = '부하'${targetId ? ' AND target_id = ?' : ''} THEN CAST(response_value AS UNSIGNED) ELSE NULL END) AS members
      FROM survey_response_flat
      WHERE evaluation_type IN ('본인', '상사', '부하')
    `;
    const params: any[] = [];
    if (targetId) {
      // 본인, 상사, 부하 각각에 targetId 파라미터 1개씩
      params.push(targetId, targetId, targetId);
    }
    if (period) {
      query += " AND CONCAT(survey_year, '-Q', survey_quarter) = ?";
      params.push(period);
    }
    query += ' GROUP BY question_no, question_text';
    query += ' ORDER BY question_no';

    console.log('Executing query with params:', { query, params });
    const [rows]: any[] = await pool.query(query, params);
    console.log('comparison API rows:', rows);

    if (!Array.isArray(rows)) {
      throw new Error('Database response is not an array');
    }

    const comparisonData = rows.map((r: any) => ({
      principle: r.principle || '',
      name: r.principle || '',
      self: r.self ? Number(r.self) : 0,
      manager: r.manager ? Number(r.manager) : 0,
      members: r.members ? Number(r.members) : 0
    }));
    res.json(comparisonData);
  } catch (error) {
    console.error('Error in /api/comparison:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 평가 대상자 목록 반환 (survey_response_flat에서 중복 없이 추출)
app.get('/api/targets', async (req: any, res: any) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT target_id AS id, target_name AS name
       FROM survey_response_flat
       WHERE target_id IS NOT NULL AND target_name IS NOT NULL
       ORDER BY name`
    );
    res.json(rows || []);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: 'DB 조회 오류', details: err.message });
      return;
    } else {
      res.status(500).json({ error: 'DB 조회 오류', details: String(err) });
      return;
    }
  }
});

// Raw Data 전체 추출 라우트
app.get('/api/raw-data', async (req: any, res: any) => {
  try {
    const { period, targetId } = req.query;
    let query = `
      SELECT
        sr.target_id,
        sr.target_name AS target_name,
        sr.respondent_id,
        sr.respondent_name AS respondent_name,
        u.employee_id,
        sr.evaluation_type,
        CONCAT(sr.survey_year, '-Q', sr.survey_quarter) AS period,
        MAX(CASE WHEN CAST(sr.question_no AS CHAR) = '1' THEN sr.response_value END) AS Q01,
        MAX(CASE WHEN CAST(sr.question_no AS CHAR) = '2' THEN sr.response_value END) AS Q02,
        MAX(CASE WHEN CAST(sr.question_no AS CHAR) = '3' THEN sr.response_value END) AS Q03,
        MAX(CASE WHEN CAST(sr.question_no AS CHAR) = '4' THEN sr.response_value END) AS Q04,
        MAX(CASE WHEN CAST(sr.question_no AS CHAR) = '5' THEN sr.response_value END) AS Q05,
        MAX(CASE WHEN CAST(sr.question_no AS CHAR) = '6' THEN sr.response_value END) AS Q06,
        MAX(CASE WHEN CAST(sr.question_no AS CHAR) = '7' THEN sr.response_value END) AS Q07,
        MAX(CASE WHEN CAST(sr.question_no AS CHAR) = '8' THEN sr.response_value END) AS Q08,
        MAX(CASE WHEN CAST(sr.question_no AS CHAR) = '9' THEN sr.response_value END) AS Q09,
        MAX(CASE WHEN CAST(sr.question_no AS CHAR) = '10' THEN sr.response_value END) AS Q10,
        MAX(CASE WHEN CAST(sr.question_no AS CHAR) = '11' THEN sr.response_value END) AS Q11,
        MAX(CASE WHEN CAST(sr.question_no AS CHAR) = '12' THEN sr.response_value END) AS Q12,
        MAX(CASE WHEN CAST(sr.question_no AS CHAR) = '13' THEN sr.response_value END) AS Q13
      FROM survey_response_flat sr
      LEFT JOIN users u ON sr.target_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (period) {
      query += ' AND CONCAT(sr.survey_year, "-Q", sr.survey_quarter) = ?';
      params.push(period);
    }
    if (targetId) {
      query += ' AND sr.target_id = ?';
      params.push(targetId);
    }
    query += ` GROUP BY sr.target_id, sr.target_name, sr.respondent_id, sr.respondent_name, u.employee_id, sr.evaluation_type, period`;
    query += ' ORDER BY period DESC';
    const [rows]: any[] = await pool.query(query, params);
    res.json(rows || []);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: 'DB 조회 오류', details: err.message });
      return;
    } else {
      res.status(500).json({ error: 'DB 조회 오류', details: String(err) });
      return;
    }
  }
});

// 본인 평가 총 응답자 수 반환 API → 상사+구성원 기준, 필터 적용
app.get('/api/total-respondents', async (req: any, res: any) => {
  try {
    const { period, targetId } = req.query;
    let query = `
      SELECT COUNT(DISTINCT respondent_id) AS total
      FROM survey_response_flat
      WHERE evaluation_type IN ('상사', '부하')
    `;
    const params: any[] = [];
    if (period) {
      query += ' AND CONCAT(survey_year, "-Q", survey_quarter) = ?';
      params.push(period);
    }
    if (targetId) {
      query += ' AND target_id = ?';
      params.push(targetId);
    }
    const [rows]: any[] = await pool.query(query, params);
    res.json({ total: rows[0]?.total ?? 0 });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: 'DB 조회 오류', details: err.message });
      return;
    } else {
      res.status(500).json({ error: 'DB 조회 오류', details: String(err) });
      return;
    }
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

export { app };