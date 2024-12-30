import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, isValid, differenceInYears } from 'date-fns';

const PtinfoList = () => {
  const [ptinfos, setPtinfos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // URLのクエリパラメータからページ番号と検索クエリを取得
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const pageParam = parseInt(query.get('page'), 10);
    const searchParam = query.get('search') || '';

    if (pageParam && pageParam !== page) {
      setPage(pageParam);
    } else if (!pageParam) {
      setPage(1);
    }

    if (searchParam !== searchQuery) {
      setSearchQuery(searchParam);
      setSearchTerm(searchParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // ページ番号や検索クエリが変更されたときにデータを取得
  useEffect(() => {
    let isMounted = true; // マウント状態を管理
    const controller = new AbortController(); // 重複リクエスト防止

    const fetchPtinfos = async () => {
      try {
        console.log('Fetching ptinfos with page:', page, 'searchQuery:', searchQuery); // デバッグ用
        const timestamp = new Date().getTime(); // キャッシュ防止用のタイムスタンプ
        const response = await axios.get('/api/ptinfos', {
          params: { page, limit, searchTerm: searchQuery, _t: timestamp },
          signal: controller.signal,
        });
        if (isMounted) {
          console.log('Fetched ptinfos:', response.data); // デバッグ用
          setPtinfos(response.data.ptinfos);
          setTotal(response.data.total);
          setError('');
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request canceled:', error.message);
        } else {
          console.error('Error fetching ptinfos:', error);
          setError('患者情報の取得に失敗しました。再度お試しください。');
        }
      }
    };

    fetchPtinfos();

    return () => {
      isMounted = false; // アンマウント時に状態を更新
      controller.abort(); // 不要なリクエストをキャンセル
    };
  }, [page, limit, searchQuery]);

  // 検索バーの入力変更ハンドラー
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 検索ボタンのクリックハンドラー
  const handleSearch = () => {
    setPage(1); // 検索時には1ページ目にリセット
    setSearchQuery(searchTerm);
    navigate(`?page=1&search=${encodeURIComponent(searchTerm)}`);
  };

  // 患者詳細ページへのダブルクリックハンドラー
  const handleRowDoubleClick = (ptnumber) => {
    navigate(`/ptinfos/${ptnumber}?page=${page}&search=${encodeURIComponent(searchQuery)}`);
  };

  // 行のクリックハンドラー（選択状態の管理）
  const handleRowClick = (ptnumber) => {
    setSelectedRow(ptnumber);
  };

  // 前のページへ移動するボタンのハンドラー
  const handlePreviousPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      navigate(`?page=${newPage}&search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // 次のページへ移動するボタンのハンドラー
  const handleNextPage = () => {
    if (page < Math.ceil(total / limit)) {
      const newPage = page + 1;
      setPage(newPage);
      navigate(`?page=${newPage}&search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // ホームに戻るボタンのハンドラー
  const handleHome = () => {
    navigate('/home');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">患者情報一覧</h1>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="患者番号で検索"
          value={searchTerm}
          onChange={handleSearchChange}
          className="p-2 border rounded"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded ml-2 hover:bg-blue-600"
        >
          検索
        </button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border-b">患者番号</th>
            <th className="py-2 px-4 border-b">患者名</th>
            <th className="py-2 px-4 border-b">生年月日</th>
            <th className="py-2 px-4 border-b">年齢</th>
            <th className="py-2 px-4 border-b">性別</th>
          </tr>
        </thead>
        <tbody>
          {ptinfos.length > 0 ? (
            ptinfos.map((ptinfo) => {
              const birthdate = ptinfo.birth ? new Date(ptinfo.birth) : null;
              const isValidBirthdate = birthdate ? isValid(birthdate) : false;
              return (
                <tr
                  key={ptinfo.ptnumber}
                  className={`hover:bg-gray-100 ${selectedRow === ptinfo.ptnumber ? 'bg-blue-100' : ''}`}
                  onDoubleClick={() => handleRowDoubleClick(ptinfo.ptnumber)}
                  onClick={() => handleRowClick(ptinfo.ptnumber)}
                >
                  <td className="py-2 px-4 border-b">{ptinfo.ptnumber}</td>
                  <td className="py-2 px-4 border-b">{ptinfo.ptname}</td>
                  <td className="py-2 px-4 border-b">
                    {isValidBirthdate ? format(birthdate, 'yyyy/MM/dd') : '無効な日付'}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {isValidBirthdate ? differenceInYears(new Date(), birthdate) : '無効な日付'}
                  </td>
                  <td className="py-2 px-4 border-b">{ptinfo.sex || ptinfo.gender}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="py-2 px-4 border-b text-center">
                該当する患者情報がありません
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={page === 1}
          className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
            page === 1 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          前のページ
        </button>
        <span className="text-xl font-semibold">
          ページ {page} / {Math.ceil(total / limit)}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page * limit >= total}
          className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
            page * limit >= total ? 'opacity-50 cursor-not-allowed' : ''
          }`}
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

export default PtinfoList;