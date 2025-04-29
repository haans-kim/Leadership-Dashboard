import { createConnection } from 'typeorm';

const connection = createConnection({
  type: 'mysql',
  host: import.meta.env.VITE_DB_HOST,
  port: Number(import.meta.env.VITE_DB_PORT),
  username: import.meta.env.VITE_DB_USER,
  password: import.meta.env.VITE_DB_PASS,
  database: import.meta.env.VITE_DB_NAME,
  entities: [],
  synchronize: true,
});

export const getDataFromDatabase = async (company: string, period: string) => {
  // Mock implementation
  return [
    { company, period, respondents: Math.floor(Math.random() * 100) },
  ];
};

export async function getDataFromDatabase(company: string, period: string): Promise<{ company: string; period: string; respondents: number; }[]> {
  const queryRunner = (await connection).createQueryRunner();
  await queryRunner.connect();
  const result = await queryRunner.query(`SELECT name as company, period, COUNT(*) as respondents FROM companies WHERE name = ?`, [company]);
  console.log('쿼리 결과:', result);
  await queryRunner.release();
  return result;
} 