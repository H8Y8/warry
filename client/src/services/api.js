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
    console.log('收到響應:', `${response.status} ${JSON.stringify(response.data)}`);
    
    // 處理登入請求的特殊邏輯
    if (response.config.url === '/api/auth/login') {
      console.log('登入請求響應:', response.data);
      
      // 如果登入失敗
      if (response.data && response.data.success === false) {
        console.log('登入失敗，返回自定義錯誤:', response.data);
        
        // 建立一個自定義錯誤物件，保留伺服器返回的所有資訊
        const customError = new Error(response.data.message || '登入失敗');
        customError.isCustomError = true;
        customError.type = response.data.type || 'unknown';
        customError.message = response.data.message || '未知錯誤';
        customError.data = response.data;
        
        // 確保自定義錯誤物件的所有屬性都清晰可見
        console.log('自定義錯誤物件詳情:', {
          message: customError.message,
          type: customError.type,
          isCustomError: customError.isCustomError,
          data: customError.data
        });
        
        return Promise.reject(customError);
      }
    }
    
    return response;
  },
  error => {
    console.error('API 錯誤響應:', error);
    
    // 確保所有錯誤都有一個統一的格式
    if (!error.isCustomError) {
      error.isCustomError = true;
      error.type = error.response?.status === 401 ? 'auth' : 'network';
      error.message = error.response?.data?.message || '網路連線異常，請稍後再試';
    }
    
    return Promise.reject(error);
  }
);

export default api;
