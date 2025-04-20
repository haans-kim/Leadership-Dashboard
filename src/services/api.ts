export interface AggregatedResult {
  principle: string;   // 리더십 원칙 명칭
  average: number;     // 평균 점수
  count: number;       // 응답 수
}

export interface SurveyResult {
  principle: string;   // 리더십 원칙 명칭
  score: number;       // 점수
  date: string;        // 측정 일자 (ISO 8601)
  team: string;        // 조직/팀 명칭
  userId?: string;     // 사용자 ID (선택)
}

export async function getAggregatedResults(): Promise<AggregatedResult[]> {
  const res = await fetch('/api/results/aggregated');
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  return res.json();
}

export async function getAllResults(): Promise<SurveyResult[]> {
  const res = await fetch('/api/results');
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  return res.json();
}

export async function downloadExcelReport(): Promise<void> {
  const res = await fetch('/api/results/report/excel');
  if (!res.ok) throw new Error(`API error: ${res.statusText}`);
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'report.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadPdfReport(): Promise<void> {
  const res = await fetch('/api/results/report/pdf');
  if (!res.ok) throw new Error(`API error: ${res.statusText}`);
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'report.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
} 