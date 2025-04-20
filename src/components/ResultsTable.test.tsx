import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResultsTable from './ResultsTable';
import * as api from '../services/api';

describe('ResultsTable', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('로딩 중 상태를 표시합니다', () => {
    vi.spyOn(api, 'getAllResults').mockImplementation(() => new Promise(() => {}));
    render(<ResultsTable />);
    expect(screen.getByText('로딩 중...')).toBeTruthy();
  });

  it('에러 발생 시 에러 메시지를 표시합니다', async () => {
    vi.spyOn(api, 'getAllResults').mockRejectedValue(new Error('fail'));
    render(<ResultsTable />);
    const errorEl = await screen.findByText(/에러: fail/);
    expect(errorEl).toBeTruthy();
  });

  it('데이터 로딩 후 테이블을 렌더링합니다', async () => {
    const data = [
      { principle: '원칙1', score: 5, date: '2024-01-01', team: '팀A', userId: 'user1' },
    ];
    vi.spyOn(api, 'getAllResults').mockResolvedValue(data as any);
    render(<ResultsTable />);
    expect(await screen.findByText('원칙1')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('2024-01-01')).toBeTruthy();
  });
}); 