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
      
      const isLoginRequest = error.config.url.includes('/auth/login');
      const isLoginPage = window.location.pathname === '/login';
      
      // 如果是登入請求，直接返回錯誤，不執行任何重定向
      if (isLoginRequest) {
        return Promise.reject(error);
      }
      
      // 對於其他 401 錯誤（非登入請求），執行登出操作
      if (error.response.status === 401 && !isLoginPage) {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        
        // 如果已經在登入頁面，不需要重定向
        if (!isLoginPage) {
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