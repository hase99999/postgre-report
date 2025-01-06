import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // axiosInstanceをインポート
import { useParams, Link, useLocation } from 'react-router-dom';

const TeachingFileDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const fromPage = location.state?.fromPage || 1;

  const [teachingFile, setTeachingFile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeachingFile = async () => {
      try {
        const response = await axiosInstance.get(`/teachingFiles/${id}`);
        setTeachingFile(response.data);
      } catch (error) {
        console.error('TeachingFileの取得中にエラーが発生しました:', error);
        setError('TeachingFileの取得に失敗しました。もう一度お試しください。');
      }
    };

    fetchTeachingFile();
  }, [id]);

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!teachingFile) {
    return <div className="text-center mt-10">読み込み中...</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6">TeachingFile 詳細</h1>
      <ul className="space-y-4">
        <li>
          <span className="font-semibold">ID:</span> {teachingFile.id}
        </li>
        <li>
          <span className="font-semibold">PT Number:</span> {teachingFile.ptnumber}
        </li>
        <li>
          <span className="font-semibold">Site:</span> {teachingFile.site}
        </li>
        <li>
          <span className="font-semibold">Field:</span> {teachingFile.field}
        </li>
        <li>
          <span className="font-semibold">Age/Sex:</span> {teachingFile.agesex}
        </li>
        <li>
          <span className="font-semibold">History:</span> {teachingFile.pthistory}
        </li>
        <li>
          <span className="font-semibold">Answer:</span> {teachingFile.answer}
        </li>
        <li>
          <span className="font-semibold">Explanation:</span> {teachingFile.explanation}
        </li>
        <li>
          <span className="font-semibold">Registration Date:</span> {new Date(teachingFile.registration).toLocaleDateString()}
        </li>
        <li>
          <span className="font-semibold">Registered By:</span> {teachingFile.registname}
        </li>
        <li>
          <span className="font-semibold">Difficulty Level:</span> {teachingFile.difficultylevel}
        </li>
        <li>
          <span className="font-semibold">Pathology:</span> {teachingFile.pathology}
        </li>
        <li>
          <span className="font-semibold">Publication:</span> {teachingFile.publication ? 'Yes' : 'No'}
        </li>
      </ul>
      <div className="mt-6">
        <Link to={`/teachingFiles?page=${fromPage}`}>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
            一覧に戻る
          </button>
        </Link>
      </div>
    </div>
  );
};

export default TeachingFileDetail;