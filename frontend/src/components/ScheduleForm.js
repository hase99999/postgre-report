import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ScheduleForm = () => {
  const [examstartdatetime, setExamstartdatetime] = useState('');
  const [examenddatetime, setExamenddatetime] = useState('');
  const [ptnumber, setPtnumber] = useState('');
  const [department, setDepartment] = useState('');
  const [doctor, setDoctor] = useState('');
  const [ivrname, setIvrname] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const fetchSchedule = async () => {
        try {
          const response = await axios.get(`/api/schedules/${id}`);
          const schedule = response.data;
          setExamstartdatetime(schedule.examstartdatetime);
          setExamenddatetime(schedule.examenddatetime);
          setPtnumber(schedule.ptnumber);
          setDepartment(schedule.department);
          setDoctor(schedule.doctor);
          setIvrname(schedule.ivrname);
        } catch (error) {
          console.error('Error fetching schedule:', error);
        }
      };

      fetchSchedule();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const scheduleData = {
        examstartdatetime,
        examenddatetime,
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

      navigate('/schedules');
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleStartDateChange = (e) => {
    const startDate = e.target.value;
    setExamstartdatetime(startDate);
    // 終了時間の日付を開始時間と同じに設定し、開始時間の45分後に設定
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 45);
    setExamenddatetime(endDate.toISOString().slice(0, 16));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{id ? 'スケジュール修正' : '新規スケジュール入力'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="examstartdatetime">
            検査開始日時
          </label>
          <input
            type="datetime-local"
            id="examstartdatetime"
            value={examstartdatetime}
            onChange={handleStartDateChange}
            step="300" // 5分毎
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="examenddatetime">
            検査終了日時
          </label>
          <input
            type="datetime-local"
            id="examenddatetime"
            value={examenddatetime}
            onChange={(e) => setExamenddatetime(e.target.value)}
            step="300" // 5分毎
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ptnumber">
            患者番号
          </label>
          <input
            type="text"
            id="ptnumber"
            value={ptnumber}
            onChange={(e) => setPtnumber(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="department">
            部門
          </label>
          <input
            type="text"
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="doctor">
            医師
          </label>
          <input
            type="text"
            id="doctor"
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ivrname">
            IVR名
          </label>
          <input
            type="text"
            id="ivrname"
            value={ivrname}
            onChange={(e) => setIvrname(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {id ? '修正' : '登録'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm;