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
  Tooltip, Legend, Label
} from 'recharts';

interface TimeSeriesData { quarter: string; score: number; }
interface PrincipleScore { principle: string; name: string; score: number; }
interface ComparisonData { principle: string; name: string; self: number; manager: number; members: number; }
interface DistributionData { name: string; value: number; }

type TabKey = 'overview' | 'trends' | 'comparison' | 'raw';

// Y축 레이블을 두 줄로 렌더링하는 커스텀 tick 함수 (OverviewTab에서도 사용 가능)
export const renderCustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const text: string = payload.value;
  const len = text.length;
  const mid = Math.ceil(len / 2);
  const first = text.substring(0, mid);
  const second = text.substring(mid);
  return (
    <text x={x} y={y} textAnchor="end" fontSize={12} dy={4}>
      {first}
      <tspan x={x} dy={16}>{second}</tspan>
    </text>
  );
};

const Dashboard: React.FC = () => {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [principleScores, setPrincipleScores] = useState<PrincipleScore[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [distributionData, setDistributionData] = useState<DistributionData[]>([]);
  const [periodOptions, setPeriodOptions] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [targetOptions, setTargetOptions] = useState<{ id: number; name: string }[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<number | ''>('');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);

  // 초기 로드: 대상자 목록과 시계열(분기) 조회
  useEffect(() => {
    setLoading(true);
    // 평가 대상자 목록
    fetch('/api/targets')
      .then(r => r.json())
      .then(setTargetOptions)
      .catch(err => setError(err.message));
    // 시계열 데이터 로드 및 분기 옵션 설정
    fetch('/api/time-series')
      .then(r => r.json())
      .then((ts: TimeSeriesData[]) => {
        setTimeSeriesData(ts);
        const periods = ts.map(d => d.quarter);
        const sorted = [...periods].reverse();
        setPeriodOptions(sorted);
        if (sorted.length) setSelectedPeriod(sorted[0]);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  
  // 분기 또는 평가대상자 변경 시 데이터 재조회
  useEffect(() => {
    if (!selectedPeriod) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/principle-scores?period=${selectedPeriod}${selectedTarget ? `&targetId=${selectedTarget}` : ''}`).then(r => r.json()),
      fetch(`/api/distribution?period=${selectedPeriod}${selectedTarget ? `&targetId=${selectedTarget}` : ''}`).then(r => r.json()),
      fetch(`/api/comparison?period=${selectedPeriod}${selectedTarget ? `&targetId=${selectedTarget}` : ''}`).then(r => r.json()),
    ])
      .then(([ps, dist, cmp]) => {
        setPrincipleScores(ps);
        setDistributionData(dist);
        setComparisonData(cmp);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedPeriod, selectedTarget]);

  // Raw Data 탭 데이터 로드
  useEffect(() => {
    if (activeTab === 'raw') {
      const params = selectedTarget ? `?targetId=${selectedTarget}` : '';
      fetch(`/api/raw-data${params}`)
        .then(r => r.json())
        .then(setRawData)
        .catch(err => setError(err.message));
    }
  }, [activeTab, selectedTarget]);

  if (loading) return <div className="flex items-center justify-center h-screen">로딩 중...</div>;
  if (error) return <div className="text-red-500 p-4">에러: {error}</div>;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* 필터: 설문실시기간, 평가대상자 */}
      <div className="flex mb-4 space-x-4 items-center">
        <div>
          <label className="mr-2 text-sm">설문실시기간:</label>
          <select
            className="border rounded p-1 pr-8 appearance-none"
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
          >
            {periodOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 text-sm">평가대상자:</label>
          <select
            className="border rounded p-1 pr-8 appearance-none"
            value={selectedTarget}
            onChange={e => setSelectedTarget(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">전체</option>
            {targetOptions.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>
      {/* 탭 네비게이션 */}
      <div className="flex space-x-4 mb-6 mt-8">
        {(['overview','trends','comparison','raw'] as TabKey[]).map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' ? '개요' : tab === 'trends' ? '추이 분석' : tab === 'comparison' ? '비교 분석' : 'Raw Data'}
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
      {activeTab === 'comparison' && <ComparisonTab comparisonData={comparisonData} selfScores={principleScores} />}
      {activeTab === 'raw' && <RawDataTab data={rawData} />}
      
      {/* 리포트 다운로드 버튼 */}
      <div className="mt-8 flex justify-end">
        <ReportDownload />
      </div>
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
  const total = distributionData.reduce((sum, entry) => sum + entry.value, 0);
  const current = timeSeriesData.at(-1)?.score ?? 0;
  const prev = timeSeriesData.length > 1 ? timeSeriesData.at(-2)?.score ?? current : current;
  const changePct = ((current - prev) / (prev || 1) * 100).toFixed(1);

  const colors = ['#8884d8','#82ca9d','#ffc658','#FF8042','#FFBB28'];
  const filteredDistributionData = distributionData.filter(entry => entry.name && entry.name.toLowerCase() !== 'null');
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
          <div className="mt-6">
            <div className="text-sm text-gray-500">총 응답자:</div>
            <div className="text-3xl font-bold">{total}명</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500 mb-1">종합 실천도 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis domain={[0,5]} ticks={[0,1,2,3,4,5]} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: "10px" }}/>
              <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500 mb-1">평가 점수 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={filteredDistributionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={30}
                label={({ name, value, percent, x, y }) => (
                  <text x={x} y={y} fill="#000" textAnchor="middle" dominantBaseline="central" fontSize="10">
                    <tspan x={x} dy="-1em">{name}</tspan>
                    <tspan x={x} dy="1.5em">{value}명 ({(percent! * 100).toFixed(0)}%)</tspan>
                  </text>
                )}
                labelLine={{ stroke: '#666666', strokeWidth: 1, offset: 20 }}
              >
                {filteredDistributionData.map((entry, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-sm text-gray-500 mb-1">원칙별 실천도 점수</h3>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={principleScores}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 5]}
              ticks={[0,1,2,3,4,5]}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={250}
              tick={({ x, y, payload }) => (
                <text x={x} y={y} textAnchor="end" fontSize={12} dy={4}
                >{`${payload.index + 1}. ${payload.value}`}</text>
              )}
            />
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
function ComparisonTab({ comparisonData, selfScores }: { comparisonData: ComparisonData[]; selfScores: PrincipleScore[]; }) {
  // 마운트 및 데이터 변경 시 콘솔 로그
  useEffect(() => {
    console.log('comparisonData:', comparisonData);
    console.log('selfScores:', selfScores);
  }, [comparisonData, selfScores]);
  if (!comparisonData.length) return <div className="text-center text-gray-500 p-4">데이터가 없습니다.</div>;
  // selfScores에서 matching score 가져와 mergedData 생성
  const mergedData = comparisonData.map(item => {
    const selfEntry = selfScores.find(ps => ps.name === item.name);
    // self 값을 정수로 반올림
    return { ...item, self: selfEntry ? Math.round(selfEntry.score) : Math.round(item.self) };
  });
  // debug: mergedData 확인
  console.log('mergedData:', mergedData);
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-sm text-gray-500 mb-1">비교 분석 (RadarChart)</h3>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2">문항</th>
                <th className="px-4 py-2">구성원</th>
                <th className="px-4 py-2">본인</th>
                <th className="px-4 py-2">상사</th>
              </tr>
            </thead>
            <tbody>
              {mergedData.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2 align-top">{idx + 1}. {item.name}</td>
                  <td className="px-4 py-2 align-top">{item.members.toFixed(2)}</td>
                  <td className="px-4 py-2 align-top">{item.self.toFixed(0)}</td>
                  <td className="px-4 py-2 align-top">{item.manager.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={mergedData} cx="50%" cy="50%" outerRadius="80%">
            <PolarGrid />
            <PolarAngleAxis dataKey="name" tickFormatter={(value, index) => `${index + 1}. ${value}`} />
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

// Raw Data 탭 컴포넌트
function RawDataTab({ data }: { data: any[] }) {
  if (!data.length) return <div className="text-center text-gray-500 p-4">데이터가 없습니다.</div>;
  const columns = [
    { key: 'period', label: '응답시기' },
    { key: 'respondent_name', label: '응답자' },
    { key: 'target_name', label: '대상자' },
    { key: 'employee_id', label: '사번' },
    { key: 'evaluation_type', label: '응답타입' },
    { key: 'Q01', label: 'Q01' },
    { key: 'Q02', label: 'Q02' },
    { key: 'Q03', label: 'Q03' },
    { key: 'Q04', label: 'Q04' },
    { key: 'Q05', label: 'Q05' },
    { key: 'Q06', label: 'Q06' },
    { key: 'Q07', label: 'Q07' },
    { key: 'Q08', label: 'Q08' },
    { key: 'Q09', label: 'Q09' },
    { key: 'Q10', label: 'Q10' },
    { key: 'Q11', label: 'Q11' },
    { key: 'Q12', label: 'Q12' },
    { key: 'Q13', label: 'Q13' },
  ];
  return (
    <div className="bg-white p-4 rounded shadow overflow-x-auto">
      <h3 className="text-sm text-gray-500 mb-1">Raw Data</h3>
      <table className="min-w-full text-sm text-left text-gray-700 border">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-2 py-1 border-b bg-gray-100">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t">
              {columns.map(col => (
                <td key={col.key} className="px-2 py-1">{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 