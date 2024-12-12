import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // ローカルストレージからトークンを削除
    localStorage.removeItem('token');
    // ログインページにリダイレクト
    navigate('/login');
  }, [navigate]);

  return null;
};

export default Logout;