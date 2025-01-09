import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const DicomList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page')) || 1;

  const [dicoms, setDicoms] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDicoms(page);
    // eslint-disable-next-line
  }, [page]);

  const fetchDicoms = async (currentPage) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/dicom?page=${currentPage}`);
      setDicoms(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Dicom一覧の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoubleClick = (id) => {
    navigate(`/dicoms/${id}?fromPage=${page}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dicom 一覧</h1>
          <button
            onClick={handleBackToHome}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
            ホームへ戻る
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="w-1/12 py-3 px-4 uppercase font-semibold text-sm text-gray-700">ID</th>
                  <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm text-gray-700">Ex Date</th>
                  <th className="w-1/12 py-3 px-4 uppercase font-semibold text-sm text-gray-700">Image Num</th>
                  <th className="w-1/12 py-3 px-4 uppercase font-semibold text-sm text-gray-700">Modality</th>
                  <th className="w-1/12 py-3 px-4 uppercase font-semibold text-sm text-gray-700">Pt ID</th>
                  <th className="w-1/12 py-3 px-4 uppercase font-semibold text-sm text-gray-700">Seq Num</th>
                  <th className="w-3/12 py-3 px-4 uppercase font-semibold text-sm text-gray-700">Series Path</th>
                </tr>
              </thead>
              <tbody>
                {dicoms.map((dicom) => (
                  <tr
                    key={dicom.id}
                    onDoubleClick={() => handleDoubleClick(dicom.id)}
                    className="hover:bg-gray-100 cursor-pointer transition duration-200"
                  >
                    <td className="py-3 px-4 text-center">{dicom.id}</td>
                    <td className="py-3 px-4">{new Date(dicom.ex_date).toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">{dicom.image_num}</td>
                    <td className="py-3 px-4 text-center">{dicom.modality}</td>
                    <td className="py-3 px-4 text-center">{dicom.pt_ID}</td>
                    <td className="py-3 px-4 text-center">{dicom.seq_num}</td>
                    <td className="py-3 px-4">{dicom.seriespath}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <div className="flex justify-center items-center mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`mx-2 px-4 py-2 rounded ${
                page === 1
                  ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } transition duration-300`}
            >
              前のページ
            </button>
            <span className="mx-2 text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`mx-2 px-4 py-2 rounded ${
                page === totalPages
                  ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } transition duration-300`}
            >
              次のページ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DicomList;