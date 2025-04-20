export interface SurveyResult {
  principle: string;   // 리더십 원칙 명칭
  score: number;       // 점수
  date: string;        // 측정 일자 (ISO 8601)
  team: string;        // 조직/팀 명칭
  userId?: string;     // 사용자 ID (선택)
} 