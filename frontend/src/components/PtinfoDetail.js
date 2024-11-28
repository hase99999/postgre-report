import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { format, isValid } from 'date-fns';

const PtinfoDetail = () => {
  const { ptnumber } = useParams();
  const [ptinfo, setPtinfo] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPtinfo = async () => {
      try {
        console.log(`Fetching ptinfo with ptnumber: ${ptnumber}`); // デバッグ用
        const response = await axios.get(`/api/ptinfos/${ptnumber}`);
        console.log('Response data:', response.data); // デバッグ用
        setPtinfo(response.data);
      } catch (error) {
        console.error('Error fetching ptinfo:', error);
        setError('データを取得できませんでした。');
      }
    };

    fetchPtinfo();
  }, [ptnumber]);

  const handleBack = () => {
    const query = new URLSearchParams(location.search);
    const page = query.get('page') || 1;
    console.log(`Navigating back to /ptinfos?page=${page}`); // デバッグ用
    navigate(`/ptinfos?page=${page}`);
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!ptinfo) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
        <p>データを取得中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">患者詳細</h1>
      <div className="bg-white shadow-md rounded p-4">
        <div className="mb-4">
          <span className="font-semibold">患者番号:</span> {ptinfo.ptnumber}
        </div>
        <div className="mb-4">
          <span className="font-semibold">患者名:</span> {ptinfo.ptname}
        </div>
        <div className="mb-4">
          <span className="font-semibold">生年月日:</span> {isValid(new Date(ptinfo.birth)) ? format(new Date(ptinfo.birth), 'yyyy/MM/dd') : '無効な日付'}
        </div>
        <div className="mb-4">
          <span className="font-semibold">性別:</span> {ptinfo.gender}
        </div>
        <div className="mb-4">
          <span className="font-semibold">レポート:</span>
          <ul>
            {(ptinfo.reports || []).map((report) => (
              <li key={report.id} className="mb-2">
                <div>検査日: {isValid(new Date(report.examdate)) ? format(new Date(report.examdate), 'yyyy/MM/dd') : '無効な日付'}</div>
                <div>モダリティ: {report.modality}</div>
                <div>ドクター: {report.doctor}</div>
                <div>部門: {report.department}</div>
                <div>画像診断: {report.imagediag}</div>
              </li>
            ))}
          </ul>
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

export default PtinfoDetail;