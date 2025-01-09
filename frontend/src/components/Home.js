import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [doctor, setDoctor] = useState(null);
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedDoctor = localStorage.getItem('doctor');
    const storedToken = localStorage.getItem('token');
    if (storedDoctor) {
      try {
        const parsedDoctor = JSON.parse(storedDoctor);
        setDoctor(parsedDoctor);
        console.log('Doctor object:', parsedDoctor); // デバッグ用ログ
      } catch (err) {
        console.error('Doctor データの解析に失敗しました:', err);
      }
    }
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const employeeNumber = doctor?.employeeNumber || doctor?.employee_number || 'N/A';
  const employeeName = doctor?.docname || doctor?.employeeName || doctor?.employee_name || doctor?.name || 'N/A';

  const handleLogout = () => {
    localStorage.removeItem('token'); // トークンを削除
    localStorage.removeItem('doctor'); // doctorオブジェクトを削除
    navigate('/login'); // ログインページにリダイレクト
  };

  return (
    <div className="bg-red-500 min-h-screen p-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">ホーム</h1>
          <p className="text-white">
            ログイン者: {employeeNumber !== 'N/A' && employeeName !== 'N/A' ? `${employeeNumber} - ${employeeName}` : '未ログイン'}
          </p>
        </div>
        <div>
          {!token ? (
            <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
              ログイン
            </Link>
          ) : (
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              ログアウト
            </button>
          )}
        </div>
      </header>
      <main>
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
          <Link to="/ptinfo-import" className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
            患者情報インポート
          </Link>
          <Link to="/report-import" className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
            レポートインポート
          </Link>
          <Link to="/doctor-import" className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
            ドクターインポート
          </Link>
          <Link to="/schedule-import" className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
            スケジュールインポート
          </Link>
          <Link to="/schedules" className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
            スケジュール一覧
          </Link>
          <Link to="/fetch-and-save" className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
            4Dデータベースからデータをフェッチして保存
          </Link>
          <Link to="/import-teaching-file" className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600">
            Teaching File をインポート
          </Link>
          <Link to="/teachingFiles" className="w-full bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600 transition duration-300 flex items-center justify-center">
            TeachingFile 一覧を見る
          </Link>
          <Link to="/import-dicom" className="w-full bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600 transition duration-300 flex items-center justify-center">
            Dicom Import
          </Link>
          {/* Dicom 一覧画面へのリンクを追加 */}
          <Link to="/dicoms" className="w-full bg-green-500 text-white p-4 rounded shadow hover:bg-green-600 transition duration-300 flex items-center justify-center">
            Dicom 一覧を見る
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;