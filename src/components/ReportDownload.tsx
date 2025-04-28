import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React, { useRef } from 'react';

// TTF 파일을 fetch해서 base64로 변환하는 함수 (예외 처리 추가)
async function fetchFontBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`폰트 파일을 불러올 수 없습니다: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  } catch (error) {
    alert('폰트 파일을 불러오는 데 실패했습니다. 콘솔을 확인하세요.');
    console.error(error);
    throw error;
  }
}

function ReportDownload({ overviewData, distributionData, trendData, comparisonData }: {
  overviewData: { avg: number; totalRespondents: number };
  distributionData: { name: string; value: number }[];
  trendData: { quarter: string; score: number }[];
  comparisonData: { name: string; self: number; manager: number; members: number }[];
}) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!overviewData || !distributionData || !trendData || !comparisonData) {
      alert('리포트 데이터가 올바르게 준비되지 않았습니다. 화면을 새로고침하거나 데이터를 확인해 주세요.');
      return;
    }
    if (reportRef.current) {
      const canvas = await html2canvas(reportRef.current, { backgroundColor: '#fff', scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight > pageHeight ? pageHeight : imgHeight);
      pdf.save('리더십-대시보드-리포트.pdf');
    }
  };

  return (
    <>
      {/* 숨겨진 리포트용 div (여기에 원하는 표/차트/텍스트 등 자유롭게 추가) */}
      <div ref={reportRef} style={{ position: 'absolute', left: '-9999px', top: 0, background: '#fff', padding: 24, width: 700 }}>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>개요</h2>
        <div style={{ marginBottom: 8 }}>종합 평점: {overviewData?.avg}</div>
        <div style={{ marginBottom: 16 }}>총 응답자: {overviewData?.totalRespondents}</div>
        <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>점수 분포</h3>
        <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 16 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>점수</th>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>응답 수</th>
            </tr>
          </thead>
          <tbody>
            {distributionData.map((d, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{d.name}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>추이분석</h3>
        <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 16 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>분기</th>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>평균점수</th>
            </tr>
          </thead>
          <tbody>
            {trendData.map((d, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{d.quarter}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{d.score.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>비교분석</h3>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>원칙</th>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>본인</th>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>상사</th>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>구성원</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((d, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{d.name}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{d.self.toFixed(2)}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{d.manager.toFixed(2)}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{d.members.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={handleDownloadPDF} className="bg-green-500 text-white px-4 py-2 rounded">
        PDF 다운로드
      </button>
    </>
  );
}

export default ReportDownload; 