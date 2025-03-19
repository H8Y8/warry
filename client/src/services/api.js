import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
    
    // 登入請求失敗時不做跳轉
    if (response.config.url.includes('/auth/login')) {
      console.log('登入請求響應:', response.data);
      if (!response.data.success) {
        return Promise.reject({
          response,
          isCustomError: true,
          ...response.data
        });
      }
    }
    
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('請求錯誤:', error.response.status, error.response.data);
      
      // 只有非登入請求遇到 401 錯誤時才自動跳轉到登入頁面
      const isLoginRequest = error.config?.url?.includes('/auth/login') || false;
      if (!isLoginRequest && error.response?.status === 401) {
        console.log('非登入請求發生401錯誤，執行跳轉');
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/login';
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
