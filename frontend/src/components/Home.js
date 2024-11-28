import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const employeeNumber = localStorage.getItem('employeeNumber');
  const employeeName = localStorage.getItem('employeeName');

  return (
    <div className="bg-red-500 min-h-screen p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-white">ホーム</h1>
        <p className="text-white">ログイン者: {employeeNumber} - {employeeName}</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/reports" className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
          レポート一覧
        </Link>
        <Link to="/doctors" className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
          ドクター一覧
        </Link>
        <Link to="/ptinfos" className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
          患者情報一覧
        </Link>
        <Link to="/import" className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
          患者情報インポート
        </Link>
        <Link to="/import/report" className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
          レポートインポート
        </Link>
        <Link to="/import/doctor" className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
          ドクターインポート
        </Link>
        <Link to="/import/schedule" className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
          スケジュールインポート
        </Link>
        <Link to="/schedules" className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
          スケジュール一覧
        </Link>
        <Link to="/login" className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
          ログイン
        </Link>
      </div>
    </div>
  );
};

export default Home;