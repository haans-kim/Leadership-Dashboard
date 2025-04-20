import React, { useState } from 'react';
import { downloadExcelReport, downloadPdfReport } from '../services/api';

const ReportDownload: React.FC = () => {
  const [loading, setLoading] = useState<{ excel: boolean; pdf: boolean }>({ excel: false, pdf: false });
  const [error, setError] = useState<string | null>(null);

  const handleExcel = async () => {
    setLoading(prev => ({ ...prev, excel: true }));
    setError(null);
    try {
      await downloadExcelReport();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, excel: false }));
    }
  };

  const handlePdf = async () => {
    setLoading(prev => ({ ...prev, pdf: true }));
    setError(null);
    try {
      await downloadPdfReport();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">리포트 다운로드</h2>
      <div className="flex space-x-4">
        <button
          onClick={handleExcel}
          disabled={loading.excel}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading.excel ? '다운로드 중...' : 'Excel 다운로드'}
        </button>
        <button
          onClick={handlePdf}
          disabled={loading.pdf}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {loading.pdf ? '다운로드 중...' : 'PDF 다운로드'}
        </button>
      </div>
      {error && <div className="text-red-500 mt-2">에러: {error}</div>}
    </div>
  );
};

export default ReportDownload; 