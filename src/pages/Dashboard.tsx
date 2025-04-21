import React, { useState, useEffect } from 'react';
import '../leadership-dashboard.css';
import ReportDownload from '../components/ReportDownload';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  RadarChart, Radar,
  ComposedChart,
  ResponsiveContainer,
  CartesianGrid,
  XAxis, YAxis,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, Legend
} from 'recharts';

interface TimeSeriesData { quarter: string; score: number; }
interface PrincipleScore { principle: string; name: string; score: number; }
interface ComparisonData { principle: string; name: string; self: number; manager: number; members: number; }
interface DistributionData { name: string; value: number; }

type TabKey = 'overview' | 'trends' | 'comparison';

const Dashboard: React.FC = () => {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [principleScores, setPrincipleScores] = useState<PrincipleScore[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [distributionData, setDistributionData] = useState<DistributionData[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/time-series').then(r => r.json()),
      fetch('/api/principle-scores').then(r => r.json()),
      fetch('/api/comparison').then(r => r.json()),
      fetch('/api/distribution').then(r => r.json()),
    ])
      .then(([ts, ps, cmp, dist]) => {
        setTimeSeriesData(ts);
        setPrincipleScores(ps);
        setComparisonData(cmp);
        setDistributionData(dist);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">로딩 중...</div>;
  if (error) return <div className="text-red-500 p-4">에러: {error}</div>;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* 리포트 다운로드 버튼 */}
      <div className="flex justify-end mb-4">
        <ReportDownload />
      </div>
      {/* 탭 네비게이션 */}
      <div className="flex space-x-4 mb-6">
        {(['overview','trends','comparison'] as TabKey[]).map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' ? '개요' : tab === 'trends' ? '추이 분석' : '비교 분석'}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === 'overview' && (
        <OverviewTab
          timeSeriesData={timeSeriesData}
          principleScores={principleScores}
          distributionData={distributionData}
        />
      )}
      {activeTab === 'trends' && <TrendsTab timeSeriesData={timeSeriesData} />}
      {activeTab === 'comparison' && <ComparisonTab comparisonData={comparisonData} />}
    </div>
  );
};

export default Dashboard;

// 개요 탭 컴포넌트
function OverviewTab({ timeSeriesData, principleScores, distributionData }: {
  timeSeriesData: TimeSeriesData[];
  principleScores: PrincipleScore[];
  distributionData: DistributionData[];
}) {
  if (!timeSeriesData.length || !principleScores.length || !distributionData.length) {
    return <div className="text-center text-gray-500 p-4">데이터가 없습니다.</div>;
  }
  const current = timeSeriesData.at(-1)?.score ?? 0;
  const prev = timeSeriesData.length > 1 ? timeSeriesData.at(-2)?.score ?? current : current;
  const changePct = ((current - prev) / (prev || 1) * 100).toFixed(1);

  const colors = ['#8884d8','#82ca9d','#ffc658','#FF8042','#FFBB28'];
  return (
    <div className="space-y-6">
      {/* 핵심 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500 mb-1">현재 종합 평점</h3>
          <div className="text-3xl font-bold">{current.toFixed(1)}</div>
          <div className={`text-sm ${+changePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {+changePct >= 0 ? '↑' : '↓'} {Math.abs(+changePct)}%
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500 mb-1">종합 실천도 추이</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis domain={[0,5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500 mb-1">평가 점수 분포</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={distributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {distributionData.map((entry, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-sm text-gray-500 mb-1">원칙별 실천도 점수</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={principleScores} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0,5]} />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" name="점수" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// 추이 탭 컴포넌트
function TrendsTab({ timeSeriesData }: { timeSeriesData: TimeSeriesData[]; }) {
  if (!timeSeriesData.length) return <div className="text-center text-gray-500 p-4">데이터가 없습니다.</div>;
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-sm text-gray-500 mb-1">추이 분석 (ComposedChart)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis domain={[0,5]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" name="바 차트" barSize={20} fill="#ffc658" />
            <Line type="monotone" dataKey="score" name="라인 차트" stroke="#0088FE" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// 비교 탭 컴포넌트
function ComparisonTab({ comparisonData }: { comparisonData: ComparisonData[]; }) {
  if (!comparisonData.length) return <div className="text-center text-gray-500 p-4">데이터가 없습니다.</div>;
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-sm text-gray-500 mb-1">비교 분석 (RadarChart)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={comparisonData} cx="50%" cy="50%" outerRadius="80%">
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis angle={30} domain={[0,5]} />
            <Radar name="자신" dataKey="self" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Radar name="상사" dataKey="manager" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
            <Radar name="구성원" dataKey="members" stroke="#FF8042" fill="#FF8042" fillOpacity={0.6} />
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 