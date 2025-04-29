import express, { Request, Response } from 'express';
import { pool } from './index';

const router = express.Router();

// Define the /api/companies endpoint
router.get('/api/companies', async (req: Request, res: Response) => {
  try {
    const [rows]: any[] = await pool.query('SELECT id, name FROM companies');
    res.json(rows);
  } catch (err: any) {
    if (err instanceof Error) {
      res.status(500).json({ error: 'DB 조회 오류', details: err.message });
    } else {
      res.status(500).json({ error: 'DB 조회 오류', details: String(err) });
    }
  }
});

export default router; 