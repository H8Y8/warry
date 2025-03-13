import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

console.log('API 基礎 URL:', baseURL);

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
    console.log('發送請求:', config.method.toUpperCase(), config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('請求錯誤:', error);
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    console.log('收到響應:', response.status, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('響應錯誤:', error.response.status, error.response.data);
      // 處理401未授權錯誤（token過期等）
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.error('請求未收到響應:', error.request);
    } else {
      console.error('請求配置錯誤:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 