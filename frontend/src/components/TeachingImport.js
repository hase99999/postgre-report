import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const TeachingImport = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('ファイルを選択してください。');
      return;
    }

    setIsUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // トークンを取得（例: ローカルストレージから）
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('認証トークンが見つかりません。ログインしてください。');
        setIsUploading(false);
        return;
      }

      // サーバーがポート3001で動作している場合、完全なURLを指定
      const response = await axiosInstance.post('http://localhost:3001/api/teaching-files/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      setMessage(response.data.message || 'インポートに成功しました。');
    } catch (error) {
      console.error('インポートエラー:', error);
      if (error.response) {
        // サーバーからのレスポンスがある場合
        setMessage(error.response.data.error || 'インポート中にエラーが発生しました。');
      } else if (error.request) {
        // リクエストは送信されたがレスポンスがない場合
        setMessage('ネットワークエラーが発生しました。サーバーが正しく動作しているか確認してください。');
      } else {
        // その他のエラー
        setMessage('エラーが発生しました。再試行してください。');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h2>データインポート</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".json,.csv,.xml" onChange={handleFileChange} />
        <button type="submit" disabled={isUploading}>
          {isUploading ? 'インポート中...' : 'インポート'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TeachingImport;