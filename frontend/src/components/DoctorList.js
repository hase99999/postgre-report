import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
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

    const fetchDoctors = async () => {
      try {
        console.log('Fetching doctors with page:', page); // デバッグ用
        const timestamp = new Date().getTime(); // キャッシュ防止用のタイムスタンプ
        const response = await axios.get('/api/doctors', {
          params: { page, limit, _t: timestamp },
          signal: controller.signal,
        });
        if (isMounted) {
          console.log('Fetched doctors:', response.data); // デバッグ用
          setDoctors(response.data.doctors);
          setTotal(response.data.total);
        }
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Error fetching doctors:', error.message); // エラーメッセージをログに出力
        }
      }
    };

    fetchDoctors();

    return () => {
      isMounted = false; // アンマウント時に状態を更新
      controller.abort(); // 不要なリクエストをキャンセル
    };
  }, [page, limit]); // pageまたはlimitが変更されたときに実行

  const handleRowClick = (docid) => {
    const targetPath = `/doctor/${docid}?page=${page}`;
    console.log(`Navigating to: ${targetPath}`); // デバッグ用
    navigate(targetPath);
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
      <h1 className="text-3xl font-bold mb-4">ドクター一覧</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border-b">名前</th>
            <th className="py-2 px-4 border-b">専門</th>
            <th className="py-2 px-4 border-b">病院</th>
          </tr>
        </thead>
        <tbody>
          {doctors.length > 0 ? (
            doctors.map((doctor) => (
              <tr key={doctor.docid} className="hover:bg-gray-100 cursor-pointer" onDoubleClick={() => handleRowClick(doctor.docid)}>
                <td className="py-2 px-4 border-b">{doctor.docname}</td>
                <td className="py-2 px-4 border-b">{doctor.department}</td>
                <td className="py-2 px-4 border-b">{doctor.hospital}</td>
              </tr>
            ))
          ) : (
            <tr key="no-doctors">
              <td colSpan="3" className="py-2 px-4 border-b text-center">該当するドクターがありません</td>
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
        <button onClick={handleHome} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          ホームに戻る
        </button>
      </div>
    </div>
  );
};

export default DoctorList;