import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, isValid } from 'date-fns';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(() => {
    const query = new URLSearchParams(window.location.search);
    return parseInt(query.get('page'), 10) || 1;
  });
  const [limit] = useState(10);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const pageParam = query.get('page');
    console.log('Current page param:', pageParam); // デバッグ用
    if (pageParam && pageParam !== page.toString()) {
      setPage(parseInt(pageParam, 10));
    }
  }, [location.search]);

  useEffect(() => {
    let isMounted = true; // マウント状態を管理
    const controller = new AbortController(); // 重複リクエスト防止

    const fetchReports = async () => {
      try {
        console.log('Fetching reports with page:', page); // デバッグ用
        const timestamp = new Date().getTime(); // キャッシュ防止用のタイムスタンプ
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('認証トークンが見つかりません。');
          return;
        }

        const response = await axiosInstance.get('http://localhost:3001/api/reports', {
          params: { page, limit, _t: timestamp },
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (isMounted) {
          console.log('Fetched reports:', response.data); // デバッグ用
          setReports(response.data.reports);
          setTotal(response.data.total);
        }
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Error fetching reports:', error);
          if (error.response) {
            // サーバーからのレスポンスがある場合
            console.error('サーバーからのエラーレスポンス:', error.response.data);
          }
        }
      }
    };

    fetchReports();

    return () => {
      isMounted = false; // アンマウント時に状態を更新
      controller.abort(); // 不要なリクエストをキャンセル
    };
  }, [page, limit]); // pageまたはlimitが変更されたときに実行

  const handleRowClick = (id) => {
    navigate(`/report/${id}?page=${page}`);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      navigate(`?page=${newPage}`);
    }
  };

  const handleNextPage = () => {
    if (page < Math.ceil(total / limit)) {
      const newPage = page + 1;
      setPage(newPage);
      navigate(`?page=${newPage}`);
    }
  };

  const handleHome = () => {
    navigate('/home');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">レポート一覧</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border-b">検査日</th>
            <th className="py-2 px-4 border-b">患者番号</th>
            <th className="py-2 px-4 border-b">患者名</th>
            <th className="py-2 px-4 border-b">モダリティ</th>
            <th className="py-2 px-4 border-b">部門</th>
            <th className="py-2 px-4 border-b">画像診断</th>
          </tr>
        </thead>
        <tbody>
          {reports.length > 0 ? (
            reports.map((report) => (
              <tr
                key={report.id}
                className="hover:bg-gray-100 cursor-pointer"
                onDoubleClick={() => handleRowClick(report.id)}
              >
                <td className="py-2 px-4 border-b">
                  {isValid(new Date(report.examdate))
                    ? format(new Date(report.examdate), 'yyyy/MM/dd')
                    : '無効な日付'}
                </td>
                <td className="py-2 px-4 border-b">{report.ptnumber}</td>
                <td className="py-2 px-4 border-b">{report.ptinfo.ptname}</td>
                <td className="py-2 px-4 border-b">{report.modality}</td>
                <td className="py-2 px-4 border-b">{report.department}</td>
                <td className="py-2 px-4 border-b">{report.imagediag}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="py-2 px-4 border-b text-center">
                該当するレポートがありません
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={page === 1}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          前のページ
        </button>
        <span className="text-xl font-semibold">ページ {page}</span>
        <button
          onClick={handleNextPage}
          disabled={page * limit >= total}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          次のページ
        </button>
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={handleHome}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  );
};

export default ReportList;