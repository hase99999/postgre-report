import React, { useState } from 'react';
import axios from 'axios';
import xml2js from 'xml2js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 認証コンテキストのインポート

const PtinfoImport = () => {
  const [jsonFile, setJsonFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null); // CSVファイルのステート
  const [xmlFile, setXmlFile] = useState(null); // XMLファイルのステート
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { auth } = useAuth(); // 認証コンテキストからトークンを取得
  const navigate = useNavigate();

  // デバッグ: auth オブジェクトの確認
  console.log('Auth Object:', currentUser);

  useEffect(() => {
    if (currentUser) {
      console.log('ユーザーが認証されています:', currentUser);
    } else {
      console.log('ユーザーが認証されていません。');
    }
  }, [currentUser]);
  
  const handleFileChange = (e, setFile) => {
    setFile(e.target.files[0]);
  };

  const handleJsonSubmit = async (e) => {
    e.preventDefault();
    if (!jsonFile) {
      alert('JSONファイルを選択してください。');
      return;
    }

    if (!currentUser || !currentUser.token) {
      alert('認証されていません。ログインしてください。');
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('file', jsonFile);

    try {
      setIsUploading(true);
      const response = await axios.post('http://localhost:3001/api/ptinfos/import/json', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${currentUser.token}`, // トークンをヘッダーに追加
        },
      });
      setMessage(response.data.message || 'JSONデータが正常にインポートされました。');
      alert(response.data.message || 'JSONデータが正常にインポートされました。');
    } catch (error) {
      console.error('JSONデータのインポート中にエラーが発生しました:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(`エラー: ${error.response.data.error}`);
        alert(`エラー: ${error.response.data.error}`);
      } else {
        setMessage('JSONデータのインポート中に不明なエラーが発生しました。');
        alert('JSONデータのインポート中に不明なエラーが発生しました。');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      alert('CSVファイルを選択してください。');
      return;
    }

    if (!auth || !auth.token) {
      alert('認証されていません。ログインしてください。');
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);
    try {
      setIsUploading(true);
      await axios.post('http://localhost:3001/api/ptinfos/import/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${auth.token}`, // トークンをヘッダーに追加
        },
      });
      setMessage('CSVデータが正常にインポートされました。');
      alert('CSVデータが正常にインポートされました。');
    } catch (error) {
      console.error('CSVデータのインポート中にエラーが発生しました:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(`エラー: ${error.response.data.error}`);
        alert(`エラー: ${error.response.data.error}`);
      } else {
        setMessage('CSVデータのインポート中に不明なエラーが発生しました。');
        alert('CSVデータのインポート中に不明なエラーが発生しました。');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleXmlSubmit = async (e) => {
    e.preventDefault();
    if (!xmlFile) {
      alert('XMLファイルを選択してください。');
      return;
    }

    if (!auth || !auth.token) {
      alert('認証されていません。ログインしてください。');
      navigate('/login');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(event.target.result);
        const data = result.ptinfos.ptinfo.map(item => ({
          ptnumber: item.ptnumber[0],
          ptname: item.ptname[0],
          ptage: item.ptage[0],
          birth: item.birth[0],
          sex: item.sex[0],
        }));
        await importData(data);
      } catch (error) {
        console.error('XMLデータのインポート中にエラーが発生しました:', error);
        alert('XMLデータのインポート中にエラーが発生しました。');
      }
    };
    reader.readAsText(xmlFile);
  };

  const importData = async (data) => {
    try {
      const chunkSize = 100; // 分割するサイズ
      setIsUploading(true);
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await axios.post('http://localhost:3001/api/ptinfos/import', chunk, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`, // トークンをヘッダーに追加
          },
        });
      }
      setMessage('データが正常にインポートされました。');
      alert('データが正常にインポートされました。');
    } catch (error) {
      console.error('データのインポート中にエラーが発生しました:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(`エラー: ${error.response.data.error}`);
        alert(`エラー: ${error.response.data.error}`);
      } else {
        setMessage('データのインポート中に不明なエラーが発生しました。');
        alert('データのインポート中に不明なエラーが発生しました。');
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
      <form onSubmit={handleJsonSubmit}>
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
      <form onSubmit={handleCsvSubmit} className="mt-4">
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
      <form onSubmit={handleXmlSubmit} className="mt-4">
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