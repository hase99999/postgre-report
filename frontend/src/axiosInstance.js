import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api', // バックエンドのベースURL
  timeout: 10000, // 必要に応じて設定
});

// リクエストインターセプターでトークンを自動的に追加
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Stored token:', token); // デバッグ用
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', `Bearer ${token}`); // デバッグ用
    } else {
      console.warn('トークンが見つかりませんでした。');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// レスポンスインターセプター（必要に応じて設定）
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized access - possibly invalid token');
      // 必要に応じてログアウト処理やリダイレクトを追加
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;