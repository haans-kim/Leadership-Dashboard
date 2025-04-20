import React, { useEffect, useState } from 'react';
import { getAllResults, SurveyResult } from '../services/api';

const ResultsTable: React.FC = () => {
  const [data, setData] = useState<SurveyResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllResults()
      .then(res => setData(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="text-red-500">에러: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-semibold mb-2">전체 설문 결과</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">원칙</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">점수</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">일자</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">팀</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자 ID</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, idx) => (
            <tr key={idx}>
              <td className="px-4 py-2 whitespace-nowrap">{item.principle}</td>
              <td className="px-4 py-2 whitespace-nowrap">{item.score}</td>
              <td className="px-4 py-2 whitespace-nowrap">{item.date}</td>
              <td className="px-4 py-2 whitespace-nowrap">{item.team}</td>
              <td className="px-4 py-2 whitespace-nowrap">{item.userId || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable; 