import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { getAggregatedResults, AggregatedResult } from '../services/api';

const AggregatedChart: React.FC = () => {
  const [data, setData] = useState<AggregatedResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAggregatedResults()
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="principle" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="average" name="평균 점수" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AggregatedChart; 