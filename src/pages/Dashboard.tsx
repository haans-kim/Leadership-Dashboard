import React, { useState, useEffect, useMemo } from 'react';
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
  const [rawData, setRawData] = useState<any[]>([]);
  const [periodOptions, setPeriodOptions] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [targetOptions, setTargetOptions] = useState<{ id: number; name: string }[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<number | ''>('');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 초기 로드: 대상자 목록과 시계열(분기) 조회
  useEffect(() => {
    setLoading(true);
    fetch('/api/targets')
      .then(r => r.json())
      .then(setTargetOptions)
      .catch(err => setError(err.message));
    fetch('/api/time-series')
      .then(r => r.json())
      .then((ts: TimeSeriesData[]) => {
        const periods = ts.map(d => d.quarter);
        const sorted = [...periods].reverse();
        setPeriodOptions(sorted);
        if (sorted.length) setSelectedPeriod(sorted[0]);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // period, target 변경 시 rawData만 서버에서 받아옴
  useEffect(() => {
    if (!selectedPeriod) return;
    setLoading(true);
    const params = [];
    if (selectedPeriod) params.push(`period=${selectedPeriod}`);
    if (selectedTarget) params.push(`targetId=${selectedTarget}`);
    const queryString = params.length ? `?${params.join('&')}` : '';
    fetch(`/api/raw-data${queryString}`)
      .then(r => r.json())
      .then(setRawData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedPeriod, selectedTarget]);

  // rawData 기반 파생 데이터 계산
  const overviewData = useMemo(() => {
    if (!rawData.length) return { avg: 0, totalRespondents: 0 };
    // 전체 평균 (모든 Q01~Q13의 평균)
    let sum = 0, count = 0;
    rawData.forEach(row => {
      for (let i = 1; i <= 13; i++) {
        const v = Number(row[`Q${i.toString().padStart(2, '0')}`]);
        if (!isNaN(v) && v !== null && v !== undefined) { sum += v; count++; }
      }
    });
    return {
      avg: count ? sum / count : 0,
      totalRespondents: rawData.length
    };
  }, [rawData]);

  const distributionData = useMemo(() => {
    // 점수별 카운트 (1~5)
    const dist: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    rawData.forEach(row => {
      for (let i = 1; i <= 13; i++) {
        const v = Number(row[`Q${i.toString().padStart(2, '0')}`]);
        if (!isNaN(v) && v >= 1 && v <= 5) dist[v]++;
      }
    });
    return Object.entries(dist).map(([k, v]) => ({ name: `${k}점`, value: v }));
  }, [rawData]);

  const comparisonData = useMemo(() => {
    // 문항별, 평가유형별 평균
    const questionLabels = [
      "업무지시할 때 목적, 기대하는 결과물, 방향성 명확히 가이드",
      "형식보다 내용(본질)에 집중",
      "전사관점에서 의사결정",
      "공동목표를 위해 적극적으로 협업하고 실행",
      "조직의 비전과 목표를 수시로 커뮤니케이션하고 적극 공유",
      "자유롭게 말할 수 있는 분위기 조성, 개개인의 다양성 존중",
      "객관적인 데이터 기반 최선의 선택",
      "기존방식보다 새로운 시도를 통해 더 나은 결과물을 창출",
      "비효율과 낭비를 즉시 개선",
      "최신 트렌드에 기민함과 빠른 실행력을 보인다",
      "고객니즈에 집중하여 최적의 솔루션을 찾는다",
      "나의 역할, 나의 상황을 고려해 의미있는 업무와 과제를 부여한다",
      "관찰과 객관적 사실에 기반해 공정하게 평가하고 건설적인 피드백을 준다"
    ];
    const result: { [q: string]: { principle: string; name: string; self: number[]; manager: number[]; members: number[] } } = {};
    rawData.forEach(row => {
      for (let i = 1; i <= 13; i++) {
        const qKey = `Q${i.toString().padStart(2, '0')}`;
        if (!result[qKey]) result[qKey] = { principle: '', name: '', self: [], manager: [], members: [] };
        const v = Number(row[qKey]);
        if (isNaN(v)) continue;
        if (row.evaluation_type === '본인') result[qKey].self.push(v);
        else if (row.evaluation_type === '상사') result[qKey].manager.push(v);
        else if (row.evaluation_type === '부하') result[qKey].members.push(v);
      }
    });
    // 평균값 계산 및 문항명 매핑
    return Object.entries(result).map(([qKey, obj], idx) => ({
      principle: questionLabels[idx] || `Q${idx+1}`,
      name: questionLabels[idx] || `Q${idx+1}`,
      self: obj.self.length ? obj.self.reduce((a, b) => a + b, 0) / obj.self.length : 0,
      manager: obj.manager.length ? obj.manager.reduce((a, b) => a + b, 0) / obj.manager.length : 0,
      members: obj.members.length ? obj.members.reduce((a, b) => a + b, 0) / obj.members.length : 0
    }));
  }, [rawData]);

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
          overviewData={overviewData}
          distributionData={distributionData}
          comparisonData={comparisonData}
        />
      )}
      {activeTab === 'comparison' && <ComparisonTab comparisonData={comparisonData} />}
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
function OverviewTab({ overviewData, distributionData, comparisonData }: {
  overviewData: { avg: number; totalRespondents: number };
  distributionData: DistributionData[];
  comparisonData: ComparisonData[];
}) {
  if (!distributionData.length) {
    return <div className="text-center text-gray-500 p-4">데이터가 없습니다.</div>;
  }
  const { avg, totalRespondents } = overviewData;

  const colors = ['#8884d8','#82ca9d','#ffc658','#FF8042','#FFBB28'];
  const filteredDistributionData = distributionData.filter(entry => entry.name && entry.name.toLowerCase() !== 'null');
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500 mb-1">현재 종합 평점</h3>
          <div className="text-3xl font-bold">{avg.toFixed(1)}</div>
          <div className="mt-6">
            <div className="text-sm text-gray-500">총 응답자:</div>
            <div className="text-3xl font-bold">{totalRespondents}명</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500 mb-1">종합 실천도 추이</h3>
          {/* 추이 차트(필요시) */}
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
            data={comparisonData}
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
            <Bar dataKey="self" name="본인" fill="#8884d8" />
            <Bar dataKey="manager" name="상사" fill="#82ca9d" />
            <Bar dataKey="members" name="구성원" fill="#FF8042" />
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
              {comparisonData.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2 align-top">{idx + 1}. {item.name}</td>
                  <td className="px-4 py-2 align-top">{item.members?.toFixed(2)}</td>
                  <td className="px-4 py-2 align-top">{item.self?.toFixed(0)}</td>
                  <td className="px-4 py-2 align-top">{item.manager?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={comparisonData} cx="50%" cy="50%" outerRadius="80%">
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