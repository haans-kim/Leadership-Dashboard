import React, { useState, useEffect } from 'react';
import SummaryTab from '../components/SummaryTab';

interface DataSet {
  id: number;
  company_name: string;
  name: string;
  description: string;
  period: string;
  file_type: string;
  row_count: number;
  uploaded_by: string;
  upload_date: string;
  status: string;
  version: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [datasets, setDatasets] = useState<DataSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch('/api/datasets')
      .then(response => response.json())
      .then(data => {
        setDatasets(data);
        setLoading(false);
      })
      .catch(err => {
        setError('데이터 로딩 중 오류가 발생했습니다.');
        setLoading(false);
        console.error('데이터셋 로딩 오류:', err);
      });
  }, []);

  useEffect(() => {
    if (activeTab === 'user') {
      setLoading(true);
      fetch('/api/users')
        .then(response => response.json())
        .then(data => {
          setUsers(data);
          setLoading(false);
        })
        .catch(err => {
          setError('사용자 정보 로딩 중 오류가 발생했습니다.');
          setLoading(false);
          console.error('사용자 정보 로딩 오류:', err);
        });
    }
  }, [activeTab]);

  const renderContent = () => {
    if (loading) return <div className="p-4">로딩 중...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    if (activeTab === 'user') {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">회사명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">성함</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사번</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전화번호</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">직함</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자 타입</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{user.company_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.employee_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.user_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">회사명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">데이터셋명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기간</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">파일유형</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">데이터 수</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">업로드</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">버전</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {datasets.map((dataset) => (
              <tr key={dataset.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{dataset.company_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{dataset.name}</td>
                <td className="px-6 py-4">{dataset.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">{dataset.period}</td>
                <td className="px-6 py-4 whitespace-nowrap">{dataset.file_type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{dataset.row_count}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div>{dataset.uploaded_by}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(dataset.upload_date).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${dataset.status === 'active' ? 'bg-green-100 text-green-800' : 
                    dataset.status === 'archived' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}>
                    {dataset.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{dataset.version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex flex-col items-start mb-6">
        <h2 className="text-2xl font-bold mb-4">관리 패널</h2>
        <div className="tabs flex space-x-4">
          <button onClick={() => setActiveTab('summary')} className={`py-2 px-4 rounded ${activeTab === 'summary' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>Summary</button>
          <button onClick={() => setActiveTab('data')} className={`py-2 px-4 rounded ${activeTab === 'data' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>데이터셋 관리</button>
          <button onClick={() => setActiveTab('user')} className={`py-2 px-4 rounded ${activeTab === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>사용자 정보</button>
        </div>
      </div>
      {activeTab === 'summary' ? (
        <div className="p-4"><SummaryTab /></div>
      ) : renderContent()}
    </div>
  );
};

export default AdminDashboard;
