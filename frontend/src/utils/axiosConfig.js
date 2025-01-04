// filepath: /Users/dj/Documents/JAVAscript/postgre-sql/frontend/src/utils/axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api', // バックエンドのベースURL
  // headers は個別に設定するため、ここでは削除
});

// リクエストインターセプターでAuthorizationヘッダーを追加
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;