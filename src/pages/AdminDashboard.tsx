import React, { useState, useEffect } from 'react';

interface DataSet {
  company: string;
  period: string;
  respondents: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('user');
  const [company, setCompany] = useState('');
  const [period, setPeriod] = useState('');
  const [dataSet, setDataSet] = useState<DataSet[]>([]);
  const [companyOptions, setCompanyOptions] = useState<{ id: number; name: string }[]>([]);
  const [periodOptions, setPeriodOptions] = useState<string[]>([]);

  useEffect(() => {
    // 회사명 정보 가져오기
    fetch('/api/companies')
      .then(r => r.json())
      .then(setCompanyOptions)
      .catch(err => console.error('회사명 정보 가져오기 오류:', err));

    // 평가시기 정보 가져오기
    fetch('/api/time-series')
      .then(r => r.json())
      .then((data: any[]) => {
        const periods = data.map((d: any) => d.quarter);
        setPeriodOptions(periods);
      })
      .catch(err => console.error('평가시기 정보 가져오기 오류:', err));
  }, []);

  useEffect(() => {
    if (company && period) {
      // 데이터베이스에서 데이터 조회
      fetch(`/api/data?company=${company}&period=${period}`)
        .then(r => r.json())
        .then(setDataSet)
        .catch(err => console.error('데이터 가져오기 오류:', err));
    }
  }, [company, period]);

  const renderContent = () => {
    switch (activeTab) {
      case 'user':
        return <div>사용자 정보 관리</div>;
      case 'data':
        return (
          <div>
            <div className="filters mb-4">
              <select onChange={(e) => setCompany(e.target.value)} value={company} className="mr-2">
                <option value="">회사명 선택</option>
                {companyOptions.map(option => (
                  <option key={option.id} value={option.name}>{option.name}</option>
                ))}
              </select>
              <select onChange={(e) => setPeriod(e.target.value)} value={period}>
                <option value="">평가시기 선택</option>
                {periodOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2">회사명</th>
                  <th className="py-2">평가시기</th>
                  <th className="py-2">응답자수</th>
                </tr>
              </thead>
              <tbody>
                {dataSet.map((data, index) => (
                  <tr key={index}>
                    <td className="py-2">{data.company}</td>
                    <td className="py-2">{data.period}</td>
                    <td className="py-2">{data.respondents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="tabs flex space-x-2">
        <button onClick={() => setActiveTab('user')} className={`py-2 px-4 rounded ${activeTab === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>사용자 정보</button>
        <button onClick={() => setActiveTab('data')} className={`py-2 px-4 rounded ${activeTab === 'data' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>데이터 관리</button>
      </div>
      <div className="content mt-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;

