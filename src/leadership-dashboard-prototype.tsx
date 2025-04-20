import { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ComposedChart
} from 'recharts';
import './leadership-dashboard.css';

interface TimeSeriesData {
  quarter: string;
  score: number;
}

interface PrincipleScore {
  principle: string;
  name: string;
  score: number;
}

interface ComparisonData {
  principle: string;
  name: string;
  self: number;
  manager: number;
  members: number;
}

interface DistributionData {
  name: string;
  value: number;
}

interface OverviewTabProps {
  timeSeriesData: TimeSeriesData[];
  principleScoreData: PrincipleScore[];
  distributionData: DistributionData[];
}

interface TrendsTabProps {
  timeSeriesData: TimeSeriesData[];
}

interface ComparisonTabProps {
  comparisonData: ComparisonData[];
}

export default function LeadershipDashboard() {
  const [selectedQuarter, setSelectedQuarter] = useState('2025-Q2');
  const [selectedPrinciple, setSelectedPrinciple] = useState('all');
  const [selectedManager, setSelectedManager] = useState('홍길동');
  const [activeTab, setActiveTab] = useState('overview');
  
  // 분기 목록
  const quarters = ['2025-Q1', '2025-Q2', '2025-Q3', '2025-Q4', '2026-Q1', '2026-Q2'];
  
  // 관리자 목록
  const managers = ['홍길동', '김철수', '이영희', '박지민', '최유진'];
  
  // 리더십 원칙 목록
  const principles = [
    { id: 'all', name: '전체' },
    { id: 'p1', name: '업무지시할 때 목적, 기대하는 결과물, 방향성 명확히 가이드' },
    { id: 'p2', name: '형식보다 내용(본질)에 집중' },
    { id: 'p3', name: '전사관점에서 의사결정' },
    { id: 'p4', name: '공동목표를 위해 적극적으로 협업하고 실행' },
    { id: 'p5', name: '조직의 비전과 목표를 수시로 커뮤니케이션하고 적극 공유' },
    { id: 'p6', name: '자유롭게 말할 수 있는 분위기 조성, 개개인의 다양성 존중' },
    { id: 'p7', name: '객관적인 데이터 기반 최선의 선택' }
  ];
  
  // 임의의 시계열 데이터
  const timeSeriesData = [
    { quarter: '2025-Q1', score: 3.4 },
    { quarter: '2025-Q2', score: 3.8 },
    { quarter: '2025-Q3', score: 4.1 },
    { quarter: '2025-Q4', score: 3.9 },
    { quarter: '2026-Q1', score: 4.3 },
    { quarter: '2026-Q2', score: 4.5 }
  ];
  
  // 임의의 원칙별 점수 데이터
  const principleScoreData = [
    { principle: 'P1', name: '목적/결과물/방향성', score: 4.2 },
    { principle: 'P2', name: '내용(본질)집중', score: 3.8 },
    { principle: 'P3', name: '전사관점 의사결정', score: 4.6 },
    { principle: 'P4', name: '협업과 실행', score: 4.0 },
    { principle: 'P5', name: '비전/목표 공유', score: 3.5 },
    { principle: 'P6', name: '다양성 존중', score: 4.3 },
    { principle: 'P7', name: '데이터 기반 결정', score: 4.1 }
  ];
  
  // 임의의 비교 데이터 (본인/상사/구성원)
  const comparisonData = [
    { principle: 'P1', name: '목적/결과물/방향성', self: 4.0, manager: 4.5, members: 3.8 },
    { principle: 'P2', name: '내용(본질)집중', self: 3.5, manager: 4.0, members: 3.2 },
    { principle: 'P3', name: '전사관점 의사결정', self: 4.2, manager: 4.8, members: 4.0 },
    { principle: 'P4', name: '협업과 실행', self: 3.8, manager: 4.3, members: 3.5 },
    { principle: 'P5', name: '비전/목표 공유', self: 3.2, manager: 3.7, members: 3.0 },
    { principle: 'P6', name: '다양성 존중', self: 4.5, manager: 4.0, members: 3.8 },
    { principle: 'P7', name: '데이터 기반 결정', self: 4.3, manager: 3.9, members: 3.6 }
  ];
  
  // 임의의 분포 데이터
  const distributionData = [
    { name: '미흡(1점)', value: 5 },
    { name: '개선필요(2점)', value: 12 },
    { name: '양호(3점)', value: 25 },
    { name: '우수(4점)', value: 38 },
    { name: '탁월(5점)', value: 20 }
  ];
  
  // 현재 선택된 탭에 따라 컴포넌트 렌더링
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab 
          timeSeriesData={timeSeriesData} 
          principleScoreData={principleScoreData} 
          distributionData={distributionData} 
        />;
      case 'trends':
        return <TrendsTab 
          timeSeriesData={timeSeriesData} 
        />;
      case 'comparison':
        return <ComparisonTab 
          comparisonData={comparisonData} 
        />;
      default:
        return <OverviewTab 
          timeSeriesData={timeSeriesData} 
          principleScoreData={principleScoreData} 
          distributionData={distributionData} 
        />;
    }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">CJ대한통운 리더십원칙 Pulse Survey</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">최근 업데이트: 2025.04.15</span>
              <button 
                type="button"
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                내보내기
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="quarter-select" className="block text-sm font-medium text-gray-700 mb-1">분기 선택</label>
              <select 
                id="quarter-select"
                className="block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm border text-gray-900 bg-white"
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
              >
                {quarters.map(quarter => (
                  <option key={quarter} value={quarter} className="text-gray-900">{quarter}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="manager-select" className="block text-sm font-medium text-gray-700 mb-1">리더 선택</label>
              <select 
                id="manager-select"
                className="block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm border text-gray-900 bg-white"
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
              >
                {managers.map(manager => (
                  <option key={manager} value={manager} className="text-gray-900">{manager}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="principle-select" className="block text-sm font-medium text-gray-700 mb-1">리더십 원칙</label>
              <select 
                id="principle-select"
                className="block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm border text-gray-900 bg-white"
                value={selectedPrinciple}
                onChange={(e) => setSelectedPrinciple(e.target.value)}
              >
                {principles.map(principle => (
                  <option key={principle.id} value={principle.id} className="text-gray-900">{principle.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-white'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                개요
              </button>
              <button
                type="button"
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'trends'
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-white'
                }`}
                onClick={() => setActiveTab('trends')}
              >
                추이 분석
              </button>
              <button
                type="button"
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'comparison'
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-white'
                }`}
                onClick={() => setActiveTab('comparison')}
              >
                비교 분석
              </button>
            </nav>
          </div>
        </div>
        
        {/* 탭 내용 */}
        {renderActiveTab()}
      </div>
    </div>
  );
}

// 개요 탭 컴포넌트
function OverviewTab({ timeSeriesData, principleScoreData, distributionData }: OverviewTabProps) {
  const CHART_COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#8884d8'];
  
  // 현재 점수 계산
  const currentScore = timeSeriesData[timeSeriesData.length - 1].score;
  const previousScore = timeSeriesData[timeSeriesData.length - 2].score;
  const changePercent = Number(((currentScore - previousScore) / previousScore * 100).toFixed(1));
  
  // 최고/최저 원칙 찾기
  const highestPrinciple = [...principleScoreData].sort((a, b) => b.score - a.score)[0];
  const lowestPrinciple = [...principleScoreData].sort((a, b) => a.score - b.score)[0];

  const getWidthClass = (score: number) => {
    const percentage = Math.round((score / 5) * 100);
    const nearestTen = Math.round(percentage / 10) * 10;
    return `w-${nearestTen}`;
  };
  
  return (
    <div className="space-y-6">
      {/* 핵심 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">현재 종합 평점</h3>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{currentScore.toFixed(1)}</span>
            <span className={`text-sm ml-2 font-medium ${Number(changePercent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Number(changePercent) >= 0 ? '↑' : '↓'} {Math.abs(Number(changePercent))}%
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-500">이전 {previousScore.toFixed(1)} 대비</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">응답률</h3>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">92%</span>
            <span className="text-sm ml-2 font-medium text-gray-600">
              (25명)
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-500">전체 대상 중</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">설문 진행 상태</h3>
          <div className="text-lg font-semibold text-green-600">완료</div>
          <div className="mt-1 text-xs text-gray-500">기간: 2025.04.01 ~ 2025.04.15</div>
        </div>
      </div>
      
      {/* 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-700 mb-4">종합 실천도 추이</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timeSeriesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
                <XAxis dataKey="quarter" />
                <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tickCount={6} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="종합 점수"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-700 mb-4">평가 점수 분포</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* 최고/최저 평가 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-700 mb-2">가장 높은 평가 항목</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-800">{highestPrinciple.name}</span>
            <span className="text-lg font-bold text-green-600">{highestPrinciple.score.toFixed(1)}</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className={`progress-bar progress-bar-high ${getWidthClass(highestPrinciple.score)}`}
            />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-700 mb-2">가장 낮은 평가 항목</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-800">{lowestPrinciple.name}</span>
            <span className="text-lg font-bold text-orange-600">{lowestPrinciple.score.toFixed(1)}</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className={`progress-bar progress-bar-low ${getWidthClass(lowestPrinciple.score)}`}
            />
          </div>
        </div>
      </div>
      
      {/* 원칙별 점수 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-700 mb-4">원칙별 실천도 점수</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={principleScoreData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
              <XAxis 
                type="number" 
                domain={[0, 5]} 
                ticks={[0, 1, 2, 3, 4, 5]}
                tickCount={6}
              />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" name="점수" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// 추이 분석 탭 컴포넌트
function TrendsTab({ timeSeriesData }: TrendsTabProps) {
  const principlesData = [
    { quarter: '2025-Q1', P1: 3.2, P2: 3.8, P3: 4.1, P4: 3.7, P5: 3.1, P6: 3.9, P7: 3.5 },
    { quarter: '2025-Q2', P1: 3.5, P2: 3.6, P3: 4.3, P4: 3.9, P5: 3.4, P6: 4.1, P7: 3.8 },
    { quarter: '2025-Q3', P1: 3.8, P2: 3.5, P3: 4.5, P4: 4.0, P5: 3.6, P6: 4.2, P7: 4.0 },
    { quarter: '2025-Q4', P1: 4.0, P2: 3.7, P3: 4.4, P4: 3.8, P5: 3.5, P6: 4.3, P7: 3.9 },
    { quarter: '2026-Q1', P1: 4.2, P2: 3.8, P3: 4.6, P4: 4.0, P5: 3.5, P6: 4.3, P7: 4.1 },
    { quarter: '2026-Q2', P1: 4.5, P2: 4.0, P3: 4.7, P4: 4.2, P5: 3.7, P6: 4.5, P7: 4.3 }
  ];
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-700 mb-4">종합 실천도 추이</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={timeSeriesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
              <XAxis dataKey="quarter" />
              <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tickCount={6} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                name="종합 점수"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-700 mb-4">원칙별 실천도 추이</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={principlesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tickCount={6} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="P1" name="목적/결과물/방향성" stroke="#8884d8" />
              <Line type="monotone" dataKey="P2" name="내용(본질)집중" stroke="#82ca9d" />
              <Line type="monotone" dataKey="P3" name="전사관점 의사결정" stroke="#ff7300" />
              <Line type="monotone" dataKey="P4" name="협업과 실행" stroke="#0088FE" />
              <Line type="monotone" dataKey="P5" name="비전/목표 공유" stroke="#00C49F" />
              <Line type="monotone" dataKey="P6" name="다양성 존중" stroke="#FFBB28" />
              <Line type="monotone" dataKey="P7" name="데이터 기반 결정" stroke="#FF8042" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// 비교 분석 탭 컴포넌트
function ComparisonTab({ comparisonData }: ComparisonTabProps) {
  const diffData = comparisonData.map(item => ({
    name: item.name,
    본인상사차이: Number.parseFloat((item.self - item.manager).toFixed(1)),
    본인구성원차이: Number.parseFloat((item.self - item.members).toFixed(1)),
    상사구성원차이: Number.parseFloat((item.manager - item.members).toFixed(1))
  }));
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-700 mb-4">본인/상사/구성원 평가 비교</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
              <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tickCount={6} />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="self" name="본인 평가" fill="#8884d8" />
              <Bar dataKey="manager" name="상사 평가" fill="#82ca9d" />
              <Bar dataKey="members" name="구성원 평가" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-700 mb-4">평가 편차 분석</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={diffData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="본인상사차이" name="본인-상사" fill="#8884d8" />
              <Bar dataKey="본인구성원차이" name="본인-구성원" fill="#82ca9d" />
              <Bar dataKey="상사구성원차이" name="상사-구성원" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-700 mb-4">레이더 차트 비교</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparisonData}>
              <PolarGrid gridType="circle" strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={30} domain={[0, 5]} />
              <Radar name="본인 평가" dataKey="self" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name="상사 평가" dataKey="manager" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              <Radar name="구성원 평가" dataKey="members" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
