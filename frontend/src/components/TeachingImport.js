import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const TeachingImport = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('ファイルを選択してください。');
      return;
    }

    const formData = new FormData();
    formData.append('file', file); // フィールド名 'file' がバックエンドと一致

    try {
      const response = await axiosInstance.post('/teaching-files/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
      setError('');
      console.log('インポート成功:', response.data);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
        console.error('インポートエラー:', err.response.data.message);
      } else {
        setError('インポート中にエラーが発生しました。');
        console.error('インポートエラー:', err.message);
      }
    }
  };

  return (
    <div>
      <h2>Teaching Files インポート</h2>
      <form onSubmit={handleImport}>
        <input type="file" accept=".json,.csv,.xml" onChange={handleFileChange} />
        <button type="submit">インポート</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default TeachingImport;