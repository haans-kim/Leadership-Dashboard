import React, { useMemo } from "react";
import { useReactTable, getCoreRowModel, flexRender, ColumnDef, CellContext } from "@tanstack/react-table";
import * as XLSX from "xlsx";

interface SummaryData {
  year: number;
  quarter: string;
  avgScore: number;
  leaderCount: number;
  targetCount: number;
  respondentCount: number;
  participationRate: string;
}

interface SummaryRow {
  label: string;
  key: keyof Omit<SummaryData, "year" | "quarter">;
}

interface LeaderScoreDistribution {
  year: number;
  quarter: string;
  leaders: { targetId: string; avgScore: number }[];
}

const summaryRowLabels: SummaryRow[] = [
  { key: "avgScore", label: "평균실천도" },
  { key: "leaderCount", label: "리더" },
  { key: "targetCount", label: "응답대상" },
  { key: "respondentCount", label: "응답인원" },
  { key: "participationRate", label: "참여율" },
];

const distRowLabels = [
  { key: "over45", label: "평균 4.5 이상" },
  { key: "over4", label: "평균 4 이상" },
  { key: "over3", label: "평균 3 이상" },
  { key: "under3", label: "평균 3 미만" },
];

function exportToExcel(data: SummaryData[]) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Summary");
  XLSX.writeFile(wb, "summary.xlsx");
}

const getDistributionStats = (
  leaders: { targetId: string; avgScore: number }[] | undefined
) => {
  if (!leaders || leaders.length === 0) {
    return {
      over45: { count: 0, percent: "0%" },
      over4: { count: 0, percent: "0%" },
      over3: { count: 0, percent: "0%" },
      under3: { count: 0, percent: "0%" },
      total: 0,
    };
  }
  const total = leaders.length;
  const over45 = leaders.filter((l) => l.avgScore >= 4.5).length;
  const over4 = leaders.filter((l) => l.avgScore >= 4 && l.avgScore < 4.5).length;
  const over3 = leaders.filter((l) => l.avgScore >= 3 && l.avgScore < 4).length;
  const under3 = leaders.filter((l) => l.avgScore < 3).length;
  return {
    over45: { count: over45, percent: ((over45 / total) * 100).toFixed(1) + "%" },
    over4: { count: over4, percent: ((over4 / total) * 100).toFixed(1) + "%" },
    over3: { count: over3, percent: ((over3 / total) * 100).toFixed(1) + "%" },
    under3: { count: under3, percent: ((under3 / total) * 100).toFixed(1) + "%" },
    total,
  };
};

const SummaryTab: React.FC = () => {
  const [summaryData, setSummaryData] = React.useState<SummaryData[]>([]);
  const [leaderScoreDist, setLeaderScoreDist] = React.useState<LeaderScoreDistribution[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/summary-table").then((res) => {
        if (!res.ok) throw new Error("서버 오류");
        return res.json();
      }),
      fetch("/api/leader-score-distribution").then((res) => {
        if (!res.ok) throw new Error("서버 오류");
        return res.json();
      }),
    ])
      .then(([summary, dist]) => {
        setSummaryData(summary);
        setLeaderScoreDist(dist);
        setLoading(false);
      })
      .catch(() => {
        setError("요약 데이터를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      });
  }, []);

  const distHeaders = summaryData.map((d) => `${d.year}년 ${d.quarter}`);
  const distByPeriod: Record<string, ReturnType<typeof getDistributionStats>> = {};
  leaderScoreDist.forEach((period) => {
    let quarterLabel = period.quarter;
    if (/^\d+$/.test(quarterLabel)) {
      quarterLabel = `${quarterLabel}분기`;
    }
    const key = `${period.year}년 ${quarterLabel}`;
    distByPeriod[key] = getDistributionStats(period.leaders);
  });

  if (loading) {
    return <div className="p-4">로딩 중...</div>;
  }
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  // 하나의 테이블로 합치기
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">요약 및 리더 실천도 분포</h3>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={() => exportToExcel(summaryData)}
        >
          엑셀 내보내기
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-center">구분</th>
              {distHeaders.map((header) => (
                <th key={header} className="px-4 py-2 text-center">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 요약 행 */}
            {summaryRowLabels.map(row => (
              <tr key={row.key}>
                <td className="px-4 py-2 text-center">{row.label}</td>
                {summaryData.map((d) => (
                  <td key={d.year + d.quarter + row.key} className="px-4 py-2 text-center">
                    {d[row.key]}
                  </td>
                ))}
              </tr>
            ))}
            {/* 공백 행 */}
            <tr>
              <td colSpan={distHeaders.length + 1} style={{ height: 24, background: "#f9fafb" }} />
            </tr>
            {/* 분포 행 */}
            {distRowLabels.map(row => (
              <tr key={row.key}>
                <td className="px-4 py-2 text-center">{row.label}</td>
                {distHeaders.map((header) => (
                  <td key={header + row.key} className="px-4 py-2 text-center">
                    {distByPeriod[header]?.[row.key]?.count ?? 0}
                    <br />
                    <span className="text-xs text-gray-500">
                      ({distByPeriod[header]?.[row.key]?.percent ?? "0%"})
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SummaryTab;
