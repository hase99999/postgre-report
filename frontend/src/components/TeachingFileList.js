import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // axiosInstanceをインポート
import { Link, useSearchParams } from 'react-router-dom';

const TeachingFileList = () => {
  const [teachingFiles, setTeachingFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchTeachingFiles = async (page) => {
    try {
      const response = await axiosInstance.get('/teachingFiles', {
        params: { page: page, limit: 20 },
      });
      setTeachingFiles(response.data.data);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('TeachingFilesの取得中にエラーが発生しました:', error);
      setError('TeachingFilesの取得に失敗しました。もう一度お試しください。');
    }
  };

  useEffect(() => {
    const page = parseInt(searchParams.get('page'), 10) || 1;
    setCurrentPage(page);
    fetchTeachingFiles(page);
  }, [searchParams]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setSearchParams({ page: currentPage + 1 });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setSearchParams({ page: currentPage - 1 });
    }
  };

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">TeachingFile 一覧</h1>
        <Link to="/">
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300">
            ホームに戻る
          </button>
        </Link>
      </div>
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">PT Number</th>
            <th className="py-2 px-4 border-b">Site</th>
            <th className="py-2 px-4 border-b">Field</th>
            <th className="py-2 px-4 border-b">詳細</th>
          </tr>
        </thead>
        <tbody>
          {teachingFiles.map(file => (
            <tr key={file.id} className="hover:bg-gray-100">
              <td className="py-2 px-4 border-b text-center">{file.id}</td>
              <td className="py-2 px-4 border-b text-center">{file.ptnumber}</td>
              <td className="py-2 px-4 border-b text-center">{file.site}</td>
              <td className="py-2 px-4 border-b text-center">{file.field}</td>
              <td className="py-2 px-4 border-b text-center">
                <Link 
                  to={`/teachingFiles/${file.id}`} 
                  state={{ fromPage: currentPage }}
                >
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
                    詳細
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 mr-2 ${currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded`}
        >
          前へ
        </button>
        <span className="px-4 py-2">
          ページ {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 ml-2 ${currentPage === totalPages ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded`}
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default TeachingFileList;