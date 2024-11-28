import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedRow, setSelectedRow] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const pageParam = query.get('page');
    if (pageParam && pageParam !== page.toString()) {
      setPage(parseInt(pageParam, 10));
    }
  }, [location.search]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('/api/reports', {
          params: { page, limit },
        });
        console.log('Response data:', response.data); // デバッグ用
        setReports(response.data.reports);
        setTotal(response.data.total);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, [page, limit]);

  const handleRowDoubleClick = (id) => {
    navigate(`/report/${id}?page=${page}`);
  };

  const handleRowClick = (id) => {
    setSelectedRow(id);
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
                className={`hover:bg-gray-100 ${selectedRow === report.id ? 'selected' : ''}`}
                onDoubleClick={() => handleRowDoubleClick(report.id)}
                onClick={() => handleRowClick(report.id)}
              >
                <td className="py-2 px-4 border-b">
                  {format(new Date(report.examdate), 'yyyy/MM/dd')}
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
              <td colSpan="6" className="py-2 px-4 border-b text-center">レポートがありません</td>
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
        <span className="text-xl font-semibold">
          {page} / {Math.ceil(total / limit)}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page === Math.ceil(total / limit)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          次のページ
        </button>
      </div>
      <div className="flex justify-between mt-4">
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