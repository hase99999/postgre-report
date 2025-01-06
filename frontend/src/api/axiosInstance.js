import axios from 'axios';

// Axiosインスタンスの作成
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001', // バックエンドのベースURL
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプターでAuthorizationヘッダーを追加
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('トークンが見つかりませんでした。');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// レスポンスインターセプター
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized access - トークンが無効です。ログイン画面へリダイレクトします。');
      // 必要に応じてログアウト処理やリダイレクトを追加
      // 例:
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// デフォルトエクスポートのみ
export default axiosInstance;