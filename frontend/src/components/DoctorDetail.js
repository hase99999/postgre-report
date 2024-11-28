import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const DoctorDetail = () => {
  const { docid } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        console.log(`Fetching doctor with docid: ${docid}`); // デバッグ用
        const response = await axios.get(`/api/doctors/${docid}`);
        console.log('Response data:', response.data); // デバッグ用
        setDoctor(response.data);
      } catch (error) {
        console.error('Error fetching doctor:', error);
        setError('データを取得できませんでした。');
      }
    };

    fetchDoctor();
  }, [docid]);

  const handleBack = () => {
    const query = new URLSearchParams(location.search);
    const page = query.get('page') || 1;
    navigate(`/doctors?page=${page}`);
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!doctor) {
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
        <div className="mb-4">
          <span className="font-semibold">ドクターID:</span> {doctor.docid}
        </div>
        <div className="mb-4">
          <span className="font-semibold">名前:</span> {doctor.docname}
        </div>
        <div className="mb-4">
          <span className="font-semibold">部門:</span> {doctor.department}
        </div>
        <div className="mb-4">
          <span className="font-semibold">病院:</span> {doctor.hospital}
        </div>
        <div className="mb-4">
          <span className="font-semibold">レベル:</span> {doctor.level}
        </div>
        <div className="mb-4">
          <span className="font-semibold">社員番号:</span> {doctor.employeeNumber}
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