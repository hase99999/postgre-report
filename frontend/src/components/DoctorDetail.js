import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const DoctorDetail = () => {
  const { docid } = useParams(); // useParamsフックを使用してdocidを取得
  const [doctor, setDoctor] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ローディング状態を管理
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const controller = new AbortController();

    const fetchDoctor = async () => {
      setIsLoading(true);
      try {
        console.log(`Fetching doctor with id: ${docid}`); // デバッグ用
        const response = await axios.get(`/api/doctors/${docid}`, {
          signal: controller.signal,
        });
        console.log('Response data:', response.data); // デバッグ用
        setDoctor(response.data);
      } catch (error) {
        if (error.name === 'CanceledError') {
          console.log('Request canceled:', error.message);
        } else {
          console.error('Error fetching doctor:', error);
          setError('データを取得できませんでした。');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (docid) {
      fetchDoctor();
    } else {
      console.error('Doctor ID is undefined'); // デバッグ用
      setError('ドクターIDが不明です。');
      setIsLoading(false);
    }

    return () => {
      controller.abort(); // キャンセル
    };
  }, [docid]);

  const handleBack = () => {
    const query = new URLSearchParams(location.search);
    const page = query.get('page') || 1;
    console.log(`Navigating back to /doctors?page=${page}`); // デバッグ用
    navigate(`/doctors?page=${page}`);
  };

  if (isLoading) {
    return <div>データを取得中...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!doctor || Object.keys(doctor).length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
        <p>データを取得中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">ドクター詳細</h1>
      <div className="bg-white shadow-md rounded p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="font-semibold">名前:</span> {doctor.docname}
          </div>
          <div>
            <span className="font-semibold">専門:</span> {doctor.department}
          </div>
          <div>
            <span className="font-semibold">病院:</span> {doctor.hospital}
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <button
            onClick={handleBack}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;