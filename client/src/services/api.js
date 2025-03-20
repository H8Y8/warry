import axios from 'axios';

// 設置基礎URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  timeout: 10000, // 10 秒超時
  headers: {
    'Content-Type': 'application/json'
  }
});

// 請求攔截器
api.interceptors.request.use(
  config => {
    console.log('發送請求:', `${config.method.toUpperCase()} ${config.url}`);
    
    // 不再自動設置 limit 參數，讓各個組件自行控制分頁
    return config;
  },
  error => {
    console.error('請求發送失敗:', error);
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  response => {
    console.log('[API Response]:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    return response;
  },
  error => {
    console.error('[API Error]:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    return Promise.reject(error);
  }
);

export default api;
