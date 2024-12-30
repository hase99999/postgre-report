import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { format, isValid } from 'date-fns';

const ReportDetail = () => {
  // useParamsのキーをルート定義に合わせて確認してください
  const { id } = useParams(); // ルートが "/report/:id" の場合
  // const { reportId } = useParams(); // ルートが "/report/:reportId" の場合

  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ローディング状態を管理
  const navigate = useNavigate();
  const location = useLocation();

  // URLのクエリパラメータから ptnumber, page, search を取得
  const query = new URLSearchParams(location.search);
  const ptnumber = query.get('ptnumber') || '';
  const page = query.get('page') || 1;
  const search = query.get('search') || '';

  useEffect(() => {
    const controller = new AbortController();

    const fetchReport = async () => {
      setIsLoading(true);
      try {
        console.log(`Fetching report with ID: ${id}`); // デバッグ用
        const response = await axios.get(`/api/reports/${id}`, {
          signal: controller.signal,
        });
        console.log('Response data:', response.data); // デバッグ用
        
        if (!response.data) {
          throw new Error('不正なレスポンス構造');
        }

        setReport(response.data);
        setError(null);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request canceled:', error.message);
        } else {
          console.error('Error fetching report:', error);
          setError('レポートを取得できませんでした。');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();

    return () => {
      controller.abort();
    };
  }, [id]);

  const handleBack = () => {
    navigate(-1); // ブラウザの履歴を一つ戻る
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
        <p>データを取得中...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!report) {
    return <div className="text-red-500">レポートが見つかりません。</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">レポート詳細</h1>
      <div className="bg-white shadow-md rounded p-4">
        <div className="mb-4">
          <span className="font-semibold">レポートID:</span> {report.id}
        </div>
        <div className="mb-4">
          <span className="font-semibold">患者番号:</span> {ptnumber}
        </div>
        <div className="mb-4">
          <span className="font-semibold">検査日:</span>{" "}
          {report.examdate && isValid(new Date(report.examdate))
            ? format(new Date(report.examdate), "yyyy/MM/dd")
            : "無効な日付"}
        </div>
        <div className="mb-4">
          <span className="font-semibold">モダリティ:</span> {report.modality || "N/A"}
        </div>
        <div className="mb-4">
          <span className="font-semibold">ドクター:</span> {report.doctor || "N/A"}
        </div>
        <div className="mb-4">
          <span className="font-semibold">部門:</span> {report.department || "N/A"}
        </div>
        <div className="mb-4">
          <span className="font-semibold">画像診断:</span> {report.imagediag || "N/A"}
        </div>
        {/* 他のレポート詳細情報をここに追加 */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handleBack}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            戻る
          </button>
          <button
            onClick={() => navigate(`/ptinfos/${ptnumber}?page=${page}&search=${encodeURIComponent(search)}`)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            患者詳細に戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;