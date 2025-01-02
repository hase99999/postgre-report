import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const doctorString = localStorage.getItem('doctor');
    let doctor = null;

    if (doctorString && doctorString !== 'undefined') { // 'undefined' のチェックを追加
      try {
        doctor = JSON.parse(doctorString);
      } catch (error) {
        console.error('Doctor情報のパースに失敗しました:', error);
        localStorage.removeItem('doctor'); // 不正なデータをクリア
      }
    }

    if (token && doctor) {
      setCurrentUser({ token, doctor });
      console.log('AuthProvider: User authenticated', { token, doctor }); // デバッグログ
    } else {
      setCurrentUser(null);
      console.log('AuthProvider: No user authenticated'); // デバッグログ
    }
  }, []);

  const login = (doctorData) => {
    if (doctorData && doctorData.token && doctorData.doctor) {
      setCurrentUser(doctorData);
      localStorage.setItem('token', doctorData.token);
      localStorage.setItem('doctor', JSON.stringify(doctorData.doctor)); // Doctor情報を保存
      console.log('AuthProvider: User logged in', doctorData); // デバッグログ
    } else {
      console.error('ログインデータが不完全です:', doctorData);
      alert('ログインデータに問題があります。');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('doctor');
    console.log('AuthProvider: User logged out'); // デバッグログ
  };

  const value = {
    currentUser,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};