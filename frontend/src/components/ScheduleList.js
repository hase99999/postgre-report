import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  startOfDay,
  endOfDay
} from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [selectedRow, setSelectedRow] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // URL クエリパラメータの初期化
    const query = new URLSearchParams(location.search);
    const viewModeParam = query.get('viewMode') || 'week';
    const currentDateParam = query.get('currentDate');
    const queryDate = currentDateParam ? new Date(currentDateParam) : new Date();
  
    // 状態の初期設定
    setViewMode(viewModeParam);
    setCurrentDate(queryDate);
  }, []); // 初回のみ実行

  

  // 表示期間の計算
  const startOfCurrentPeriod = viewMode === 'week'
    ? startOfWeek(currentDate, { weekStartsOn: 1 })
    : startOfMonth(currentDate);

  const endOfCurrentPeriod = viewMode === 'week'
    ? endOfWeek(currentDate, { weekStartsOn: 1 })
    : endOfMonth(currentDate);

  // データ取得用のuseEffect
  useEffect(() => {
    // 戻るときの状態を優先
    if (location.state) {
      const { viewMode: savedViewMode, currentDate: savedDate } = location.state;
      if (savedViewMode) setViewMode(savedViewMode);
      if (savedDate) setCurrentDate(new Date(savedDate));
    } else {
      // クエリパラメータから初期化
      const query = new URLSearchParams(location.search);
      const viewModeParam = query.get('viewMode') || 'week';
      const currentDateParam = query.get('currentDate');
      const queryDate = currentDateParam ? new Date(currentDateParam) : new Date();
  
      setViewMode(viewModeParam);
      setCurrentDate(queryDate);
    }
  }, [location.state, location.search]); // location.state や location.search の変更を監視

  // API 呼び出し用 useEffect
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
  
    const fetchSchedules = async () => {
      try {
        const start = startOfDay(startOfCurrentPeriod).toISOString();
        const end = endOfDay(endOfCurrentPeriod).toISOString();
  
        console.log('Fetching schedules:', { start, end }); // デバッグ用
  
        const response = await axios.get('/api/schedules', {
          params: { start, end },
          signal: controller.signal,
        });
  
        if (isMounted) {
          const formattedData = response.data.schedules.map((s) => ({
            ...s,
            examstartdatetime: new Date(s.examstartdatetime),
            examenddatetime: new Date(s.examenddatetime),
          }));
  
          formattedData.sort(
            (a, b) =>
              a.examstartdatetime - b.examstartdatetime ||
              a.examenddatetime - b.examenddatetime
          );
  
          setSchedules(formattedData); // データ設定
        }
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Error fetching schedules:', error);
          // 必要に応じてエラーメッセージを表示
        }
      }
    };
  
    fetchSchedules();
  
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [startOfCurrentPeriod.getTime(), endOfCurrentPeriod.getTime()]); // 状態変更のみで発火

  
  useEffect(() => {
    console.log('URL Params (before API call):', { viewMode, currentDate });
    console.log('State (before API call):', { viewMode, currentDate });
  }, [viewMode, currentDate]);

  const handlePreviousPeriod = () => {
    const newDate = viewMode === 'week'
      ? subWeeks(currentDate, 1)
      : subMonths(currentDate, 1);

    setCurrentDate(newDate);
  };
  
  const handleNextPeriod = () => {
    const newDate = viewMode === 'week'
      ? addWeeks(currentDate, 1)
      : addMonths(currentDate, 1);

    setCurrentDate(newDate);
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleRowDoubleClick = (id) => {
    navigate(`/schedules/${id}`, {
      state: {
        viewMode,
        currentDate: currentDate.toISOString(),
      },
    });
  };

  const handleRowClick = (id) => {
    setSelectedRow(id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/schedules/${id}`);
      setSchedules(schedules.filter((schedule) => schedule.id !== id));
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleHome = () => {
    navigate('/home');
  };

  const handleNewSchedule = () => {
    navigate('/schedule/new');
  };

  const count = schedules.length;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">スケジュール一覧</h1>
      <div className="flex justify-between mb-4">
        <button
          onClick={handlePreviousPeriod}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          前の{viewMode === 'week' ? '週' : '月'}
        </button>
        <span className="text-xl font-semibold">
          {format(startOfCurrentPeriod, 'yyyy/MM/dd')} - {format(endOfCurrentPeriod, 'yyyy/MM/dd')}
        </span>
        <button
          onClick={handleNextPeriod}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          次の{viewMode === 'week' ? '週' : '月'}
        </button>
      </div>
      <div className="flex justify-center mb-4">
        <button
          onClick={() => handleViewModeChange('week')}
          className={`px-4 py-2 rounded ${viewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
        >
          週表示
        </button>
        <button
          onClick={() => handleViewModeChange('month')}
          className={`px-4 py-2 rounded ml-2 ${viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
        >
          月表示
        </button>
      </div>
      <div className="mb-4">
        <span className="text-xl font-semibold">検査件数: {count}件</span>
      </div>
      <button
        onClick={handleNewSchedule}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4"
      >
        新規入力
      </button>
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border-b">検査日</th>
            <th className="py-2 px-4 border-b">検査開始時間</th>
            <th className="py-2 px-4 border-b">検査終了時間</th>
            <th className="py-2 px-4 border-b">患者番号</th>
            <th className="py-2 px-4 border-b">患者名</th>
            <th className="py-2 px-4 border-b">部門</th>
            <th className="py-2 px-4 border-b">医師</th>
            <th className="py-2 px-4 border-b">IVR名</th>
            <th className="py-2 px-4 border-b">操作</th>
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
                <td className="py-2 px-4 border-b">{format(schedule.examstartdatetime, 'yyyy/MM/dd')}</td>
                <td className="py-2 px-4 border-b">{format(schedule.examstartdatetime, 'HH:mm')}</td>
                <td className="py-2 px-4 border-b">{format(schedule.examenddatetime, 'HH:mm')}</td>
                <td className="py-2 px-4 border-b">{schedule.ptnumber}</td>
                <td className="py-2 px-4 border-b">{schedule.ptinfo?.ptname ?? '患者情報なし'}</td>
                <td className="py-2 px-4 border-b">{schedule.department}</td>
                <td className="py-2 px-4 border-b">{schedule.doctor}</td>
                <td className="py-2 px-4 border-b">{schedule.ivrname}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="py-2 px-4 border-b text-center">
                この{viewMode === 'week' ? '週' : '月'}のスケジュールはありません
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex justify-center mt-4">
        <button
          onClick={handleHome}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  );
};

export default ScheduleList;