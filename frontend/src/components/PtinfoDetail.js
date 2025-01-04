import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { useParams, useNavigate, useLocation} from 'react-router-dom';
import { isValid, format } from 'date-fns'; // format を追加

const PtinfoDetail = () => {
  const { ptnumber } = useParams();
  const [ptinfo, setPtinfo] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
 const [isLoading, setIsLoading] = useState(true);
  // URLのクエリパラメータからページ番号と検索クエリを取得
  const query = new URLSearchParams(location.search);
  const page = query.get('page') || 1;
  const search = query.get('search') || '';

  useEffect(() => {
    const fetchPtinfo = async () => {
      try {
        console.log(`Fetching ptinfo with ptnumber: ${ptnumber}`); // デバッグ用
        const response = await axiosInstance.get(`/ptinfos/${ptnumber}`);
        console.log('Response data:', response.data); // デバッグ用
        setPtinfo(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching ptinfo:', error);
        setError('データを取得できませんでした。');
      }finally {
        setIsLoading(false);
      }
    };

    fetchPtinfo();
  }, [ptnumber]);

  const handleBack = () => {
    navigate(-1); // ブラウザの履歴を一つ戻る
  };

  const handleReportClick = (reportId) => {
    console.log(`Navigating to report with ID: ${reportId}`); // ログを追加
    navigate(`/report/${reportId}?ptnumber=${ptnumber}&page=${page}&search=${encodeURIComponent(search)}`);
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
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
          <span className="font-semibold">生年月日:</span> {ptinfo.birth && isValid(new Date(ptinfo.birth)) ? format(new Date(ptinfo.birth), 'yyyy/MM/dd') : '無効な日付'}
        </div>
        <div className="mb-4">
          <span className="font-semibold">性別:</span> {ptinfo.sex || ptinfo.gender}
        </div>
        <div className="mb-4">
          <span className="font-semibold">レポート:</span>
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border-b">検査日</th>
                <th className="py-2 px-4 border-b">モダリティ</th>
                <th className="py-2 px-4 border-b">ドクター</th>
                <th className="py-2 px-4 border-b">部門</th>
                <th className="py-2 px-4 border-b">画像診断</th>
              </tr>
            </thead>
            <tbody>
              {(ptinfo.reports || []).map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleReportClick(report.id)}
                >
                  <td className="py-2 px-4 border-b">
                    {report.examdate && isValid(new Date(report.examdate)) ? format(new Date(report.examdate), 'yyyy/MM/dd') : '無効な日付'}
                  </td>
                  <td className="py-2 px-4 border-b">{report.modality || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{report.doctor || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{report.department || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{report.imagediag || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
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