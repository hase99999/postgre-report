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
  // 戻るときに渡す状態を保持する
  const [viewMode, setViewMode] = useState(location.state?.viewMode || 'week');
  const [currentDate, setCurrentDate] = useState(
    location.state?.currentDate ? new Date(location.state.currentDate) : new Date()
  );
  useEffect(() => {
    let isMounted = true; // マウント状態を管理
    const controller = new AbortController(); // 重複リクエスト防止

    const fetchSchedule = async () => {
      try {
        console.log(`Fetching schedule with ID: ${id}`); // デバッグ用
        const response = await axios.get(`/api/schedules/${id}`, {
          signal: controller.signal,
        });
        console.log('Response data:', response.data); // デバッグ用
        if (isMounted) {
          setSchedule(response.data);
        }
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Error fetching schedule:', error);
          setError('データを取得できませんでした。');
        }
      }
    };

    fetchSchedule();

    return () => {
      isMounted = false; // アンマウント時に状態を更新
      controller.abort(); // 不要なリクエストをキャンセル
    };
  }, [id]);

  const handleBack = () => {
    navigate('/schedules', {
      state: { viewMode, currentDate }, // 状態を保存
    });
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
          <span className="font-semibold">スケジュールID:</span> {schedule.id}
        </div>
        <div className="mb-4">
          <span className="font-semibold">検査日:</span> {isValid(new Date(schedule.examstartdatetime)) ? format(new Date(schedule.examstartdatetime), 'yyyy/MM/dd') : '無効な日付'}
        </div>
        <div className="mb-4">
          <span className="font-semibold">検査時間:</span> {isValid(new Date(schedule.examstartdatetime)) ? format(new Date(schedule.examstartdatetime), 'HH:mm:ss') : '無効な時間'}
        </div>
        <div className="mb-4">
          <span className="font-semibold">患者番号:</span> {schedule.ptnumber}
        </div>
        <div className="mb-4">
          <span className="font-semibold">患者名:</span> {schedule.ptinfo?.ptname ?? '患者情報なし'}
        </div>
        <div className="mb-4">
          <span className="font-semibold">部門:</span> {schedule.department}
        </div>
        <div className="mb-4">
          <span className="font-semibold">医師:</span> {schedule.doctor}
        </div>
        <div className="mb-4">
          <span className="font-semibold">IVR名:</span> {schedule.ivrname}
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