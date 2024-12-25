// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // トークンが存在する場合、ユーザーを設定
      setCurrentUser({ token });
    }
  }, []);

  const login = (user) => {
    setCurrentUser(user);
    localStorage.setItem('token', user.token);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
  };

  const value = {
    currentUser,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};