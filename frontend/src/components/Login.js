// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', { employeeNumber, password });
      console.log(response.data); // レスポンスを確認
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('employeeNumber', response.data.employeeNumber); // ここで保存
      localStorage.setItem('employeeName', response.data.employeeName); // ここで保存
      navigate('/home'); // ログイン成功時にホーム画面にリダイレクト
      setError(''); // エラーメッセージをクリア
    } catch (error) {
      setError('ログインに失敗しました');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">ログイン</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="employeeNumber">社員ID</label>
            <input
              type="text"
              id="employeeNumber"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">ログイン</button>
        </form>
      </div>
    </div>
  );
};

export default Login;