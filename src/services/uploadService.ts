import * as XLSX from 'xlsx';
import { createConnection } from 'typeorm';

// 데이터베이스 연결 설정
const connection = createConnection({
    type: 'sqlite',
    database: 'survey.db',
    entities: [],
    synchronize: true,
});

// 엑셀 파일 읽기 및 데이터베이스 업로드 함수
async function uploadExcelToDb(filePath: string) {
    // 엑셀 파일 읽기
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // 데이터 검증
    const requiredFields = ['응답자 ID', '응답자 이름', '부서', '직급', '설문 날짜', ...Array.from({ length: 13 }, (_, i) => `Q${i + 1}`)];
    const isValid = data.every((row: any) => requiredFields.every(field => field in row));
    if (!isValid) {
        throw new Error('필수 필드가 누락되었습니다.');
    }

    // 데이터베이스에 업로드
    const queryRunner = (await connection).createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        await queryRunner.manager.insert('survey_results', data);
        await queryRunner.commitTransaction();
        console.log('데이터베이스 업로드 완료');
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
} 