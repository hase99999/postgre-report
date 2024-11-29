import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { format, isValid } from 'date-fns';

const ReportDetail = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        console.log(`Fetching report with id: ${id}`); // デバッグ用
        const response = await axios.get(`/api/reports/${id}`);
        console.log('Response data:', response.data); // デバッグ用
        setReport(response.data);
      } catch (error) {
        console.error('Error fetching report:', error);
        setError('データを取得できませんでした。');
      }
    };

    fetchReport();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!report) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
        <p>データを取得中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">レポート詳細</h1>
      <div className="bg-white shadow-md rounded p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="font-semibold">検査日:</span> <span className="font-semibold p-2">{isValid(new Date(report.examdate)) ? format(new Date(report.examdate), 'yyyy/MM/dd') : '無効な日付'}</span>
        
            <span className="font-semibold">モダリティ:</span> <span className="font-semibold">{report.modality}</span>
          </div>
          <div>
            <span className="font-semibold">患者番号:</span> <span className="font-semibold p-2">{report.ptnumber}</span>
          
            <span className="font-semibold p-2">患者名:</span> <span className="font-semibold">{report.ptinfo.ptname}</span>
          </div>
          <div>
            <span className="font-semibold">部門:</span> <span className="p-1">{report.department}</span>
         
            <span className="font-semibold p-2">担当医:</span> <span className="font-semibold">{report.doctor}</span>
          </div>
        </div>
        <div className="mb-4">
          <span className="font-semibold">臨床診断:</span> <span className="font-semibold">{report.clinicaldiag}</span>
        </div>
  
        <div className="mb-4">
          <span className="font-semibold">レポート:</span> <span className="font-semibold">{report.report}</span>
        </div>
        <div className="mb-4">
          <span className="font-semibold">画像診断:</span> <span className="font-semibold">{report.imagediag}</span>
        </div>
        <div className="flex justify-between mt-4">
          <button
            onClick={handleBack}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;