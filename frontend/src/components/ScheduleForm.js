import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { startOfWeek, formatISO, isValid, parseISO } from 'date-fns';

const ScheduleForm = () => {
  const [examstartdatetime, setExamstartdatetime] = useState('');
  const [examenddatetime, setExamenddatetime] = useState('');
  const [ptnumber, setPtnumber] = useState('');
  const [department, setDepartment] = useState('');
  const [doctor, setDoctor] = useState('');
  const [ivrname, setIvrname] = useState('');
  const [id, setId] = useState(null); // Assuming editing capability
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const scheduleId = searchParams.get('id');
    if (scheduleId) {
      // Fetch existing schedule data and populate fields
      axios.get(`/api/schedules/${scheduleId}`)
        .then(response => {
          const schedule = response.data;
          setExamstartdatetime(schedule.examstartdatetime.substring(0,16)); // For input type="datetime-local"
          setExamenddatetime(schedule.examenddatetime.substring(0,16));
          setPtnumber(schedule.ptnumber);
          setDepartment(schedule.department);
          setDoctor(schedule.doctor);
          setIvrname(schedule.ivrname);
          setId(schedule.id);
        })
        .catch(error => {
          console.error('Error fetching schedule:', error);
        });
    } else {
      // 新規入力時のデフォルト値設定
      const now = new Date();
      const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000); // JSTに変換
      const startDate = jstNow.toISOString().slice(0, 16);
      const endDate = new Date(jstNow.getTime() + 45 * 60000).toISOString().slice(0, 16);
      setExamstartdatetime(startDate);
      setExamenddatetime(endDate);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const startDate = new Date(examstartdatetime);
      const endDate = new Date(examenddatetime);
      const scheduleData = {
        examstartdatetime: startDate.toISOString(),
        examenddatetime: endDate.toISOString(),
        ptnumber,
        department,
        doctor,
        ivrname,
      };

      if (id) {
        await axios.put(`/api/schedules/${id}`, scheduleData);
        console.log('Updated schedule:', scheduleData);
      } else {
        await axios.post('/api/schedules', scheduleData);
        console.log('Added new schedule:', scheduleData);
      }

      const startOfWeekDate = startOfWeek(new Date(examstartdatetime), { weekStartsOn: 1 });
      navigate(`/schedules?viewMode=week&currentDate=${startOfWeekDate.toISOString()}`);
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleStartDateChange = (e) => {
    const startDate = new Date(e.target.value);
    const jstStartDate = new Date(startDate.getTime() + 9 * 60 * 60 * 1000); // JSTに変換
    setExamstartdatetime(jstStartDate.toISOString().slice(0, 16));
    // 終了時間の日付を開始時間と同じに設定し、開始時間の45分後に設定
    const endDate = new Date(jstStartDate.getTime() + 45 * 60000);
    setExamenddatetime(endDate.toISOString().slice(0, 16));
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{id ? 'スケジュール編集' : '新規スケジュール作成'}</h2>
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
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {id ? '更新' : '保存'}
        </button>
      </form>
    </div>
  );
};

export default ScheduleForm;