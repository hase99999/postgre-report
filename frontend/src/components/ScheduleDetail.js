import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { format, isValid } from 'date-fns';

const ScheduleDetail = () => {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        console.log(`Fetching schedule with id: ${id}`); // デバッグ用
        const response = await axios.get(`/api/schedules/${id}`);
        console.log('Response data:', response.data); // デバッグ用
        setSchedule(response.data);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setError('データを取得できませんでした。');
      }
    };

    fetchSchedule();
  }, [id]);

  const handleBack = () => {
    const query = new URLSearchParams(location.search);
    const viewMode = query.get('viewMode') || 'week';
    const currentDate = query.get('currentDate') || new Date().toISOString();
    console.log(`Navigating back to /schedules?viewMode=${viewMode}&currentDate=${currentDate}`); // デバッグ用
    navigate(`/schedules?viewMode=${viewMode}&currentDate=${currentDate}`);
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!schedule) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
        <p>データを取得中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">スケジュール詳細</h1>
      <div className="bg-white shadow-md rounded p-4">
        <div className="mb-4">
          <span className="font-semibold">患者番号:</span> {schedule.ptnumber}
        </div>
        <div className="mb-4">
          <span className="font-semibold">日付:</span> {isValid(new Date(schedule.examdate)) ? format(new Date(schedule.examdate), 'yyyy/MM/dd') : '無効な日付'}
        </div>
        <div className="mb-4">
          <span className="font-semibold">時間:</span> {isValid(new Date(schedule.examtime)) ? format(new Date(schedule.examtime), 'HH:mm:ss') : '無効な時間'}
        </div>
        <div className="mb-4">
          <span className="font-semibold">ドクター:</span> {schedule.doctor}
        </div>
        <div className="mb-4">
          <span className="font-semibold">患者:</span> {schedule.ptinfo.ptname}
        </div>
        <div className="mb-4">
          <span className="font-semibold">部門:</span> {schedule.department}
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

export default ScheduleDetail;