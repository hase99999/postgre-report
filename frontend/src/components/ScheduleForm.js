import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ScheduleForm = () => {
  const [formData, setFormData] = useState({
    examdate: '',
    examtime: '',
    ptnumber: '',
    department: '',
    doctor: '',
    ivrname: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/schedules', formData);
      console.log('Schedule added:', response.data);
      navigate('/schedules'); // スケジュール一覧画面に戻る
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">スケジュール入力</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-2">
          <label className="block mb-1">検査日</label>
          <input
            type="date"
            name="examdate"
            value={formData.examdate}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">検査時間</label>
          <input
            type="time"
            name="examtime"
            value={formData.examtime}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">患者番号</label>
          <input
            type="text"
            name="ptnumber"
            value={formData.ptnumber}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">部門</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">医師</label>
          <input
            type="text"
            name="doctor"
            value={formData.doctor}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">IVR名</label>
          <input
            type="text"
            name="ivrname"
            value={formData.ivrname}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          追加
        </button>
      </form>
    </div>
  );
};

export default ScheduleForm;