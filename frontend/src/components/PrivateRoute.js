// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token'); // トークンが存在するか確認

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;