import request from 'supertest';
import { app } from './index';
import { describe, it, expect } from 'vitest';

describe('Server API Endpoints', () => {
  it('GET /api/results should return empty array', async () => {
    const res = await request(app).get('/api/results');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('GET /api/results/aggregated should return empty array', async () => {
    const res = await request(app).get('/api/results/aggregated');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('GET /api/results/report/excel returns excel file', async () => {
    const res = await request(app).get('/api/results/report/excel');
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename=\"report.xlsx\"/);
  });

  it('GET /api/results/report/pdf returns pdf file', async () => {
    const res = await request(app).get('/api/results/report/pdf');
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename=\"report.pdf\"/);
  });
}); 