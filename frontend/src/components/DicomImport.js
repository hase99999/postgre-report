import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const DicomImport = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) {
      alert('ファイルを選択してください。');
      return;
    }

    const formData = new FormData();
    formData.append('dicomFile', file);

    // 送信前にFormDataの内容を確認
    for (let pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }

    try {
      setIsLoading(true);
      const response = await axiosInstance.post('/dicom/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(response.data.message);
      navigate('/'); // インポート後にホーム画面にリダイレクト
    } catch (apiError) {
      console.error('APIへのリクエストに失敗しました:', apiError);
      if (apiError.response) {
        // サーバーからのエラーレスポンス
        console.log('サーバーからのエラー:', apiError.response.data);
        alert(`インポートに失敗しました: ${JSON.stringify(apiError.response.data.error)}`);
      } else {
        // ネットワークエラーやその他
        alert('インポート中にエラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">Dicomデータのインポート</h2>
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="mb-4"
      />
      <button
        onClick={handleImport}
        className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isLoading}
      >
        {isLoading ? 'インポート中...' : 'インポート'}
      </button>
      <button
        onClick={() => navigate('/')}
        className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        ホームに戻る
      </button>
    </div>
  );
};

export default DicomImport;