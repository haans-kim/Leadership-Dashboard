import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAggregatedResults, getAllResults, AggregatedResult, SurveyResult } from './api';

describe('API 서비스', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getAggregatedResults 성공 시 결과 반환', async () => {
    const mockData: AggregatedResult[] = [
      { principle: '원칙1', average: 4.5, count: 10 },
    ];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });
    const data = await getAggregatedResults();
    expect(data).toEqual(mockData);
  });

  it('getAggregatedResults 실패 시 에러 발생', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, statusText: 'Error' });
    await expect(getAggregatedResults()).rejects.toThrow('API error: Error');
  });

  it('getAllResults 성공 시 결과 반환', async () => {
    const mockAll: SurveyResult[] = [
      { principle: '원칙1', score: 5, date: '2024-01-01', team: '팀A' },
    ];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAll),
    });
    const data = await getAllResults();
    expect(data).toEqual(mockAll);
  });

  it('getAllResults 실패 시 에러 발생', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, statusText: 'Fail' });
    await expect(getAllResults()).rejects.toThrow('API error: Fail');
  });
}); 