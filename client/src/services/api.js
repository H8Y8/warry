import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 響應攔截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 處理401未授權錯誤（token過期等）
    if (error.response && error.response.status === 401) {
      // 清除本地存儲的token
      localStorage.removeItem('token');
      
      // 如果不是登入頁面，則重定向到登入頁面
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 