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
    const fetchPtinfos = async () => {
      try {
        const response = await axios.get('/api/ptinfos', {
          params: { page, limit, searchTerm: searchQuery },
        });
        console.log('Fetched ptinfos from DB:', response.data); // デバッグ用
        setPtinfos(response.data.ptinfos);
        setTotal(response.data.total);
      } catch (error) {
        console.error('Error fetching ptinfos:', error);
      }
    };

    fetchPtinfos();
  }, [page, limit, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    setSearchQuery(searchTerm);
  };

  const handleRowDoubleClick = (ptnumber) => {
    navigate(`/ptinfo/${ptnumber}?page=${page}`);
  };

  const handleRowClick = (ptnumber) => {
    setSelectedRow(ptnumber);
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
      <h1 className="text-3xl font-bold mb-4">患者情報一覧</h1>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="患者番号で検索"
          value={searchTerm}
          onChange={handleSearchChange}
          className="p-2 border rounded"
        />
        <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded ml-2 hover:bg-blue-600">
          検索
        </button>
      </div>
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
              const birthdate = new Date(ptinfo.birth);
              const isValidBirthdate = isValid(birthdate);
             // console.log('誕生日：',String(birthdate));
              return (
                <tr
                  key={ptinfo.ptnumber}
                  className={`hover:bg-gray-100 ${selectedRow === ptinfo.ptnumber ? 'selected' : ''}`}
                  onDoubleClick={() => handleRowDoubleClick(ptinfo.ptnumber)}
                  onClick={() => handleRowClick(ptinfo.ptnumber)}
                >
                  <td className="py-2 px-4 border-b">{ptinfo.ptnumber}</td>
                  <td className="py-2 px-4 border-b">{ptinfo.ptname}</td>
                  <td className="py-2 px-4 border-b">{isValidBirthdate ? format(birthdate, 'yyyy/MM/dd') : '無効な日付'}</td>
                  <td className="py-2 px-4 border-b">{isValidBirthdate ? differenceInYears(new Date(), birthdate) : '無効な日付'}</td>
                  <td className="py-2 px-4 border-b">{ptinfo.gender}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="py-2 px-4 border-b text-center">該当する患者情報がありません</td>
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

export default PtinfoList;