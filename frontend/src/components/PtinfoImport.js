import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
//import axios from '../utils/axiosConfig';  Axiosの設定ファイルをインポート
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 認証コンテキストのインポート

const PtinfoImport = () => {
  const [jsonFile, setJsonFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e, setFile) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e, fileType) => {
    e.preventDefault();
    let file;
    let endpoint;
    let successMessage;
  
    switch(fileType) {
      case 'json':
        file = jsonFile;
        endpoint = '/ptinfos/import/json';
        successMessage = 'JSONデータのインポートが成功しました。';
        break;
      case 'csv':
        file = csvFile;
        endpoint = '/ptinfos/import/csv';
        successMessage = 'CSVデータが正常にインポートされました。';
        break;
      case 'xml':
        file = xmlFile;
        endpoint = '/ptinfos/import/xml';
        successMessage = 'XMLデータが正常にインポートされました。';
        break;
      default:
        return;
    }
  
    if (!file) {
      alert(`${fileType.toUpperCase()}ファイルを選択してください。`);
      return;
    }
  
    if (!currentUser || !currentUser.token) {
      alert('認証トークンがありません。ログインしてください。');
      navigate('/login');
      return;
    }
  
    try {
      setIsUploading(true);
      setMessage('');
  
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await axiosInstance.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${currentUser.token}`, // トークンをヘッダーに追加
        },
      });
  
      if (response.status === 200) {
        setMessage(successMessage);
        alert(successMessage);
      } else {
        setMessage(`インポートに失敗しました: ${response.data.error}`);
        alert(`インポートに失敗しました: ${response.data.error}`);
      }
    } catch (error) {
      console.error(`${fileType.toUpperCase()}データのインポート中にエラーが発生しました:`, error);
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(`エラー: ${error.response.data.error}`);
        alert(`エラー: ${error.response.data.error}`);
      } else {
        setMessage(`${fileType.toUpperCase()}データのインポート中に不明なエラーが発生しました。`);
        alert(`${fileType.toUpperCase()}データのインポート中に不明なエラーが発生しました。`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">患者情報インポート</h1>
      
      {/* JSONインポートフォーム */}
      <form onSubmit={(e) => handleSubmit(e, 'json')}>
        <div className="mb-4">
          <label className="block mb-2">JSONファイルを選択してください:</label>
          <input 
            type="file" 
            accept=".json" 
            onChange={(e) => handleFileChange(e, setJsonFile)} 
          />
        </div>
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" 
          disabled={isUploading}
        >
          JSONインポート
        </button>
      </form>
      
      {/* CSVインポートフォーム */}
      <form onSubmit={(e) => handleSubmit(e, 'csv')} className="mt-4">
        <div className="mb-4">
          <label className="block mb-2">CSVファイルを選択してください:</label>
          <input 
            type="file" 
            accept=".csv" 
            onChange={(e) => handleFileChange(e, setCsvFile)} 
          />
        </div>
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" 
          disabled={isUploading}
        >
          CSVインポート
        </button>
      </form>
      
      {/* XMLインポートフォーム */}
      <form onSubmit={(e) => handleSubmit(e, 'xml')} className="mt-4">
        <div className="mb-4">
          <label className="block mb-2">XMLファイルを選択してください:</label>
          <input 
            type="file" 
            accept=".xml" 
            onChange={(e) => handleFileChange(e, setXmlFile)} 
          />
        </div>
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" 
          disabled={isUploading}
        >
          XMLインポート
        </button>
      </form>
      
      {/* メッセージ表示 */}
      {message && <p className="mt-4 text-center">{message}</p>}
      
      {/* 戻るボタン */}
      <button 
        onClick={handleBack} 
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
      >
        戻る
      </button>
    </div>
  );
};

export default PtinfoImport;