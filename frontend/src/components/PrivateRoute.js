// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const isAuthenticated = !!localStorage.getItem('token'); // トークンが存在するか確認

  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default PrivateRoute;