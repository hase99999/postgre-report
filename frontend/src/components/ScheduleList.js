import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, startOfDay, endOfDay } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' または 'month'
  const [selectedRow, setSelectedRow] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const viewModeParam = query.get('viewMode');
    const currentDateParam = query.get('currentDate');
    if (viewModeParam) {
      setViewMode(viewModeParam);
    }
    if (currentDateParam) {
      setCurrentDate(new Date(currentDateParam));
    }
  }, [location.search]);

  const startOfCurrentPeriod = viewMode === 'week' ? startOfWeek(currentDate, { weekStartsOn: 1 }) : startOfMonth(currentDate);
  const endOfCurrentPeriod = viewMode === 'week' ? endOfWeek(currentDate, { weekStartsOn: 1 }) : endOfMonth(currentDate);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const start = startOfDay(startOfCurrentPeriod).toISOString();
        const end = endOfDay(endOfCurrentPeriod).toISOString();
        const response = await axios.get('/api/schedules', {
          params: { start, end },
        });
        console.log('Response data:', response.data); // デバッグ用
        const formattedData = response.data.schedules.map(schedule => ({
          ...schedule,
          examdate: new Date(schedule.examdate),
          examtime: new Date(schedule.examtime),
        }));
        // 日付と時刻でソート
        formattedData.sort((a, b) => {
          const dateComparison = a.examdate - b.examdate;
          if (dateComparison !== 0) {
            return dateComparison;
          }
          return a.examtime - b.examtime;
        });
        setSchedules(formattedData);
        console.log('Fetched and Sorted Schedules:', formattedData); // デバッグ用
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    fetchSchedules();
  }, [currentDate, viewMode]); // currentDateまたはviewModeが変更されたときに実行

  const handlePreviousPeriod = () => {
    setCurrentDate(viewMode === 'week' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1));
  };

  const handleNextPeriod = () => {
    setCurrentDate(viewMode === 'week' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1));
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleRowDoubleClick = (id) => {
    console.log(`Navigating to /schedule/${id}`); // デバッグ用
    navigate(`/schedule/${id}?viewMode=${viewMode}&currentDate=${currentDate.toISOString()}`);
  };

  const handleRowClick = (id) => {
    setSelectedRow(id);
  };

  const handleHome = () => {
    navigate('/home');
  };

  const count = schedules.length;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">スケジュール一覧</h1>
      <div className="flex justify-between mb-4">
        <button onClick={handlePreviousPeriod} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          前の{viewMode === 'week' ? '週' : '月'}
        </button>
        <span className="text-xl font-semibold">
          {format(startOfCurrentPeriod, 'yyyy/MM/dd')} - {format(endOfCurrentPeriod, 'yyyy/MM/dd')}
        </span>
        <button onClick={handleNextPeriod} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          次の{viewMode === 'week' ? '週' : '月'}
        </button>
      </div>
      <div className="flex justify-center mb-4">
        <button onClick={() => handleViewModeChange('week')} className={`px-4 py-2 rounded ${viewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
          週表示
        </button>
        <button onClick={() => handleViewModeChange('month')} className={`px-4 py-2 rounded ml-2 ${viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
          月表示
        </button>
      </div>
      <div className="mb-4">
        <span className="text-xl font-semibold">検査件数: {count}件</span>
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border-b">検査日</th>
            <th className="py-2 px-4 border-b">検査時間</th>
            <th className="py-2 px-4 border-b">患者番号</th>
            <th className="py-2 px-4 border-b">患者名</th>
            <th className="py-2 px-4 border-b">部門</th>
            <th className="py-2 px-4 border-b">医師</th>
            <th className="py-2 px-4 border-b">IVR名</th>
          </tr>
        </thead>
        <tbody>
          {schedules.length > 0 ? (
            schedules.map((schedule) => (
              <tr
                key={schedule.id}
                className={`hover:bg-gray-100 ${selectedRow === schedule.id ? 'selected' : ''}`}
                onDoubleClick={() => handleRowDoubleClick(schedule.id)}
                onClick={() => handleRowClick(schedule.id)}
              >
                <td className="py-2 px-4 border-b">{format(schedule.examdate, 'yyyy/MM/dd')}</td>
                <td className="py-2 px-4 border-b">{format(schedule.examtime, 'HH:mm:ss')}</td>
                <td className="py-2 px-4 border-b">{schedule.ptnumber}</td>
                <td className="py-2 px-4 border-b">{schedule.ptinfo?.ptname ?? '患者情報なし'}</td>
                <td className="py-2 px-4 border-b">{schedule.department}</td>
                <td className="py-2 px-4 border-b">{schedule.doctor}</td>
                <td className="py-2 px-4 border-b">{schedule.ivrname}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="py-2 px-4 border-b text-center">この{viewMode === '週' ? '週' : '月'}のスケジュールはありません</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex justify-center mt-4">
        <button onClick={handleHome} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          ホームに戻る
        </button>
      </div>
    </div>
  );
};

export default ScheduleList;