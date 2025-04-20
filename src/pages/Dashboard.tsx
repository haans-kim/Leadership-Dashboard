import React from 'react';
import AggregatedChart from '../components/AggregatedChart';
import ReportDownload from '../components/ReportDownload';
import ResultsTable from '../components/ResultsTable';

const Dashboard: React.FC = () => {
  return (
    <div>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">필터 영역</h2>
        <div>필터 컴포넌트 추가 예정</div>
        <ReportDownload />
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">차트 영역</h2>
        <div>
          <AggregatedChart />
        </div>
      </section>
      <section className="mt-6">
        <ResultsTable />
      </section>
    </div>
  );
};

export default Dashboard; 