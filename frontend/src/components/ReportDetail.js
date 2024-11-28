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
    navigate('/reports');
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
        <div className="mb-4">
          <span className="font-semibold">検査日:</span> {isValid(new Date(report.examdate)) ? format(new Date(report.examdate), 'yyyy/MM/dd') : '無効な日付'}
        </div>
        <div className="mb-4">
          <span className="font-semibold">モダリティ:</span> {report.modality}
        </div>
        <div className="mb-4">
          <span className="font-semibold">ドクター:</span> {report.doctor}
        </div>
        <div className="mb-4">
          <span className="font-semibold">部門:</span> {report.department}
        </div>
        <div className="mb-4">
          <span className="font-semibold">画像診断:</span> {report.imagediag}
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