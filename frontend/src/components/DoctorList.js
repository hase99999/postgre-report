import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
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
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('/api/doctors', {
          params: { page, limit },
        });
        console.log('Fetched doctors from DB:', response.data); // デバッグ用
        setDoctors(response.data.doctors);
        setTotal(response.data.total);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, [page, limit]);

  const handleRowDoubleClick = (id) => {
    navigate(`/doctor/${id}?page=${page}`);
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
      <h1 className="text-3xl font-bold mb-4">ドクター一覧</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border-b">ドクターID</th>
            <th className="py-2 px-4 border-b">名前</th>
            <th className="py-2 px-4 border-b">部門</th>
            <th className="py-2 px-4 border-b">病院</th>
            <th className="py-2 px-4 border-b">レベル</th>
            <th className="py-2 px-4 border-b">社員番号</th>
          </tr>
        </thead>
        <tbody>
          {doctors.length > 0 ? (
            doctors.map((doctor) => (
              <tr
                key={doctor.docid}
                className={`hover:bg-gray-100 ${selectedRow === doctor.docid ? 'selected' : ''}`}
                onDoubleClick={() => handleRowDoubleClick(doctor.docid)}
                onClick={() => handleRowClick(doctor.docid)}
              >
                <td className="py-2 px-4 border-b">{doctor.docid}</td>
                <td className="py-2 px-4 border-b">{doctor.docname}</td>
                <td className="py-2 px-4 border-b">{doctor.department}</td>
                <td className="py-2 px-4 border-b">{doctor.hospital}</td>
                <td className="py-2 px-4 border-b">{doctor.level}</td>
                <td className="py-2 px-4 border-b">{doctor.employeeNumber}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="py-2 px-4 border-b text-center">ドクターがいません</td>
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

export default DoctorList;