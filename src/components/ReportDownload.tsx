import React, { useState } from 'react';
import { downloadPdfReport } from '../services/api';

const ReportDownload: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePdf = async () => {
    setLoading(true);
    setError(null);
    try {
      await downloadPdfReport();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-right">
      <button
        onClick={handlePdf}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {loading ? '다운로드 중...' : 'PDF 다운로드'}
      </button>
      {error && <div className="text-red-500 mt-2">에러: {error}</div>}
    </div>
  );
};

export default ReportDownload; 