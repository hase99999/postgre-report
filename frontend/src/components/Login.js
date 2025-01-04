import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('http://localhost:3001/api/auth/login', {
        employeeNumber: loginId,
        password: password,
      });
      console.log('Login Response:', response.data); // レスポンス内容をログ出力
      
      const { token, doctor } = response.data;
      console.log('Extracted Token:', token);
      console.log('Extracted Doctor:', doctor);
      
      if (token && doctor) {
        login({ token, doctor });
        navigate('/home');
      } else {
        throw new Error('認証情報が不完全です。');
      }
    } catch (err) {
      console.error('ログインエラー:', err);
      setError('ログインに失敗しました。従業員番号またはパスワードを確認してください。');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">ログイン</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">従業員番号:</label>
          <input
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            className="p-2 border rounded w-full"
            required
            placeholder="従業員番号を入力してください"
            autoComplete="username"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">パスワード:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border rounded w-full"
            required
            placeholder="パスワードを入力してください"
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          ログイン
        </button>
      </form>
    </div>
  );
};

export default Login;