import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// ローカルタイムを "YYYY-MM-DDTHH:mm" 形式にフォーマットする関数
const toLocalDateTime = (date) => {
  const pad = (n) => n.toString().padStart(2, '0');
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const ScheduleDetail = () => {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [examstartdatetime, setExamstartdatetime] = useState('');
  const [examenddatetime, setExamenddatetime] = useState('');
  const [ptnumber, setPtnumber] = useState('');
  const [department, setDepartment] = useState('');
  const [doctor, setDoctor] = useState('');
  const [ivrname, setIvrname] = useState('');
  const [ptname, setPtname] = useState(''); // 患者名の状態を追加
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { viewMode, currentDate } = location.state || {};

  useEffect(() => {
    // スケジュールの詳細を取得
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(`/api/schedules/${id}`);
        const scheduleData = response.data;
        setSchedule(scheduleData);
        // 日本時間に変換して設定
        setExamstartdatetime(toLocalDateTime(scheduleData.examstartdatetime));
        setExamenddatetime(toLocalDateTime(scheduleData.examenddatetime));
        setPtnumber(scheduleData.ptnumber);
        setDepartment(scheduleData.department);
        setDoctor(scheduleData.doctor);
        setIvrname(scheduleData.ivrname);
        setPtname(scheduleData.ptinfo?.ptname || ''); // 患者名を設定
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setError('データの取得に失敗しました。');
      }
    };

    fetchSchedule();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const scheduleData = {
        examstartdatetime: new Date(examstartdatetime).toISOString(),
        examenddatetime: new Date(examenddatetime).toISOString(),
        ptnumber,
        department,
        doctor,
        ivrname,
      };

      await axios.put(`/api/schedules/${id}`, scheduleData);
      console.log('Updated schedule:', scheduleData);

      navigate('/schedules', {
        state: { viewMode, currentDate }, // 状態を保存
      });
    } catch (error) {
      console.error('Error updating schedule:', error);
      setError('データの更新に失敗しました。');
    }
  };

  const handleStartDateChange = (e) => {
    setExamstartdatetime(e.target.value);
    // 終了時間の日付を開始時間と同じに設定し、開始時間の45分後に設定
    const startDate = new Date(e.target.value);
    const endDate = new Date(startDate.getTime() + 45 * 60000);
    setExamenddatetime(toLocalDateTime(endDate));
  };

  const handleBack = () => {
    navigate('/schedules', {
      state: { viewMode, currentDate }, // 状態を保存
    });
  };

  const handleCancel = () => {
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
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">開始日時</label>
            <input
              type="datetime-local"
              value={examstartdatetime}
              onChange={handleStartDateChange}
              step="300" // 5分間隔
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">終了日時</label>
            <input
              type="datetime-local"
              value={examenddatetime}
              onChange={(e) => setExamenddatetime(e.target.value)}
              step="300" // 5分間隔
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">患者番号</label>
            <input
              type="text"
              value={ptnumber}
              onChange={(e) => setPtnumber(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">患者名</label>
            <input
              type="text"
              value={ptname}
              readOnly
              className="w-full px-3 py-2 border rounded bg-gray-100"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">部門</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">医師</label>
            <input
              type="text"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">IVR名</label>
            <input
              type="text"
              value={ivrname}
              onChange={(e) => setIvrname(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              更新
            </button>
            <button
             type="button"
             onClick={handleCancel}
             className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
             キャンセル
          </button>
          </div>
        </form>
        <button
          onClick={handleBack}
         className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          戻る
        </button>
      </div>
    </div>
  );
};

export default ScheduleDetail;