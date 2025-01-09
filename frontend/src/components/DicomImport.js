import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance'; // パスをプロジェクトに合わせて調整してください

const DicomImport = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert('ファイルを選択してください。');
      return;
    }

    const formData = new FormData();
    formData.append('dicomFile', selectedFile);

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/dicom/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(`インポート成功: ${response.data.count} 件のデータが追加されました。`);
      navigate('/dicoms');
    } catch (error) {
      console.error('Dicomインポートに失敗しました:', error);
      alert('インポートに失敗しました。エラーログを確認してください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Dicomデータのインポート</h2>
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="mb-6 w-full"
        />
        <button
          onClick={handleImport}
          className={`w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 mb-4 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'インポート中...' : 'インポート'}
        </button>
        <button
          onClick={handleBackToHome}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
        >
          Home に戻る
        </button>
      </div>
    </div>
  );
};

export default DicomImport;