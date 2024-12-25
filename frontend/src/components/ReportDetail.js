import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { format, isValid } from 'date-fns';

const ReportDetail = () => {
  const { id } = useParams();
  const [report, setReport] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ローディング状態を管理
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const controller = new AbortController();

    const fetchReport = async () => {
      setIsLoading(true);
      try {
        console.log(`Fetching report with id: ${id}`); // デバッグ用
        const response = await axios.get(`/api/reports/${id}`, {
          signal: controller.signal,
        });
        console.log('Response data:', response.data); // デバッグ用
        // レスポンス構造を検証
        if (!response.data || !response.data.ptinfo) {
          throw new Error('不正なレスポンス構造');
        }
        setReport({
          examdate: response.data.examdate || '不明',
          modality: response.data.modality || '不明',
          ptnumber: response.data.ptnumber || '不明',
          ptinfo: response.data.ptinfo || { ptname: '不明' },
          department: response.data.department || '不明',
          doctor: response.data.doctor || '不明',
          clinicaldiag: response.data.clinicaldiag || '不明',
          imagediag: response.data.imagediag || '不明',
          report: response.data.report || '不明',
        });
      } catch (error) {
        if (error.name === 'CanceledError') {
          console.log('Request canceled:', error.message);
        } else {
          console.error('Error fetching report:', error);
          setError('データを取得できませんでした。');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();

    return () => {
      controller.abort(); // キャンセル
    };
  }, [id]);

  const handleBack = () => {
    const query = new URLSearchParams(location.search);
    const ptnumber = query.get('ptnumber');
    if (ptnumber) {
      console.log(`Navigating back to /ptinfos/${ptnumber}`); // デバッグ用
      navigate(`/ptinfos/${ptnumber}`);
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    console.log('isLoading state:', isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (error) console.error('Error state:', error);
  }, [error]);

  if (isLoading) {
    return <div>データを取得中...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!report || Object.keys(report).length === 0) {
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
            <span className="font-semibold">検査日:</span> {isValid(new Date(report.examdate)) ? format(new Date(report.examdate), 'yyyy/MM/dd') : '無効な日付'}
          </div>
          <div>
            <span className="font-semibold">モダリティ:</span> {report.modality}
          </div>
          <div>
            <span className="font-semibold">患者番号:</span> {report.ptnumber}
          </div>
          <div>
            <span className="font-semibold">患者名:</span> {report?.ptinfo?.ptname || '情報なし'}
          </div>
          <div>
            <span className="font-semibold">部門:</span> {report.department}
          </div>
          <div>
            <span className="font-semibold">ドクター:</span> {report.doctor}
          </div>
        </div>
        <div className="mb-4">
          <span className="font-semibold">臨床診断:</span> {report.clinicaldiag}
        </div>
        <div className="mb-4">
          <span className="font-semibold">画像診断:</span> {report.imagediag}
        </div>
        <div className="mb-4">
          <span className="font-semibold">レポート:</span> {report.report}
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