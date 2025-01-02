import React, { useState } from 'react';
import axios from 'axios';

const TeachingImport = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleImport = async () => {
    if (!file) {
      setMessage('ファイルを選択してください。');
      return;
    }
  
    if (file.type !== 'application/json') {
      setMessage('JSONファイルを選択してください。');
      return;
    }
  
    try {
      setIsUploading(true);
      const reader = new FileReader();
  
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target.result);
          console.log('送信データ:', JSON.stringify(json, null, 2)); // データ確認用
  
          const records = Array.isArray(json.records) ? json.records : [json];
  
          // 各レコードに ptnumber が存在するか確認
          records.forEach((record, index) => {
            if (!record.ptnumber) {
              console.warn(`Record ${index + 1} is missing ptnumber.`);
            }
          });
  
          const response = await axios.post('/api/teaching-files/import', { records });
          setMessage(response.data.message || 'インポートに成功しました。');
        } catch (error) {
          console.error('インポートエラー:', error);
          setMessage(error.response?.data?.error || 'インポート中にエラーが発生しました。');
        } finally {
          setIsUploading(false);
        }
      };
  
      reader.readAsText(file);
    } catch (error) {
      console.error('ファイル読み込みエラー:', error);
      setMessage('ファイルの読み込み中にエラーが発生しました。');
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Teaching File をインポート</h2>
      <div className="mb-4">
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="p-2 border rounded"
        />
      </div>
      <button
        onClick={handleImport}
        className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${
          isUploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isUploading}
      >
        {isUploading ? 'インポート中...' : 'インポート'}
      </button>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default TeachingImport;
