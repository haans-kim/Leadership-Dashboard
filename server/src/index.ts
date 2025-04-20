import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { parse } from 'csv-parse';
import { SurveyResult } from './models/SurveyResult';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });
const surveyResults: SurveyResult[] = [
  {
    principle: "신뢰와 존중",
    score: 4.5,
    date: "2025-04-01",
    team: "물류운영팀",
    userId: "user1"
  },
  {
    principle: "신뢰와 존중",
    score: 4.2,
    date: "2025-04-01",
    team: "IT개발팀",
    userId: "user2"
  },
  {
    principle: "열정과 도전",
    score: 4.8,
    date: "2025-04-01",
    team: "물류운영팀",
    userId: "user3"
  },
  {
    principle: "열정과 도전",
    score: 4.0,
    date: "2025-04-01",
    team: "IT개발팀",
    userId: "user4"
  },
  {
    principle: "고객중심",
    score: 4.6,
    date: "2025-04-01",
    team: "물류운영팀",
    userId: "user5"
  },
  {
    principle: "고객중심",
    score: 4.3,
    date: "2025-04-01",
    team: "IT개발팀",
    userId: "user6"
  },
  {
    principle: "윤리/정도",
    score: 4.7,
    date: "2025-04-01",
    team: "물류운영팀",
    userId: "user7"
  },
  {
    principle: "윤리/정도",
    score: 4.4,
    date: "2025-04-01",
    team: "IT개발팀",
    userId: "user8"
  },
  {
    principle: "실행력",
    score: 4.4,
    date: "2025-04-01",
    team: "물류운영팀",
    userId: "user9"
  },
  {
    principle: "실행력",
    score: 4.1,
    date: "2025-04-01",
    team: "IT개발팀",
    userId: "user10"
  }
];

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

// 분기별 시계열 데이터 엔드포인트
app.get('/api/time-series', (req: any, res: any) => {
  const tsMap: Record<string, { total: number; count: number }> = {};
  surveyResults.forEach(r => {
    const date = new Date(r.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const quarterNum = Math.floor((month - 1) / 3) + 1;
    const key = `${year}-Q${quarterNum}`;
    if (!tsMap[key]) tsMap[key] = { total: 0, count: 0 };
    tsMap[key].total += r.score;
    tsMap[key].count += 1;
  });
  const timeSeries = Object.entries(tsMap)
    .map(([quarter, data]) => {
      const [y, q] = quarter.split('-Q');
      return { quarter, score: data.total / data.count, year: Number(y), quarterNum: Number(q) };
    })
    .sort((a, b) => a.year === b.year ? a.quarterNum - b.quarterNum : a.year - b.year)
    .map(({ quarter, score }) => ({ quarter, score }));
  res.json(timeSeries);
});

// 원칙별 점수 엔드포인트
app.get('/api/principle-scores', (req: any, res: any) => {
  const psMap: Record<string, { total: number; count: number }> = {};
  surveyResults.forEach(r => {
    if (!psMap[r.principle]) psMap[r.principle] = { total: 0, count: 0 };
    psMap[r.principle].total += r.score;
    psMap[r.principle].count += 1;
  });
  const principleScores = Object.entries(psMap).map(([principle, data]) => ({
    principle,
    name: principle,
    score: data.total / data.count
  }));
  res.json(principleScores);
});

// 분포 데이터 엔드포인트
app.get('/api/distribution', (req: any, res: any) => {
  const distMap: Record<number, number> = {};
  surveyResults.forEach(r => {
    const scoreKey = Math.round(r.score);
    if (!distMap[scoreKey]) distMap[scoreKey] = 0;
    distMap[scoreKey] += 1;
  });
  const labels: Record<number, string> = {
    1: '미흡(1점)',
    2: '개선필요(2점)',
    3: '양호(3점)',
    4: '우수(4점)',
    5: '탁월(5점)'
  };
  const distribution = Object.entries(distMap)
    .map(([scoreStr, value]) => ({
      name: labels[+scoreStr] || `${scoreStr}점`,
      value
    }))
    .sort((a, b) => {
      const aNum = Number(a.name.match(/\d+/)?.[0] ?? '0');
      const bNum = Number(b.name.match(/\d+/)?.[0] ?? '0');
      return aNum - bNum;
    });
  res.json(distribution);
});

// 비교 데이터 엔드포인트 (임시)
app.get('/api/comparison', (req: any, res: any) => {
  const comparisonData = [
    { principle: '신뢰와 존중', name: '신뢰와 존중', self: 4.5, manager: 4.2, members: 4.3 },
    { principle: '열정과 도전', name: '열정과 도전', self: 4.8, manager: 4.1, members: 4.4 },
    { principle: '고객중심', name: '고객중심', self: 4.6, manager: 4.3, members: 4.5 },
    { principle: '윤리/정도', name: '윤리/정도', self: 4.7, manager: 4.4, members: 4.2 },
    { principle: '실행력', name: '실행력', self: 4.4, manager: 4.2, members: 4.0 }
  ];
  res.json(comparisonData);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

export { app };