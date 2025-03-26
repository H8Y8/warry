/**
 * Express應用配置
 * 設置中間件、路由和錯誤處理
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/error');
const morgan = require('morgan');
const apiRouter = require('./routes/api');

// 創建Express應用
const app = express();

// 配置CORS
app.use(cors({
  origin: function(origin, callback) {
    // 允許來自本地開發環境的請求
    if (!origin || origin === 'http://localhost:3000') {
      return callback(null, true);
    }
    
    // 允許來自192.168.100.x網段的請求
    if (/^http:\/\/192\.168\.100\.\d+(?::\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    
    console.log('被拒絕的來源:', origin);
    callback(new Error('不允許的來源'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

// 解析JSON請求體
app.use(express.json());

// 解析URL編碼的請求體
app.use(express.urlencoded({ extended: true }));

// 解析Cookie
app.use(cookieParser());

// 靜態文件服務
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api', apiRouter);

// API根路由
app.get('/api', (req, res) => {
  res.json({
    message: '歡迎使用電子產品保固記錄服務API',
    version: '1.0.0'
  });
});

// 404處理
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: '找不到請求的資源'
  });
});

// 錯誤處理中間件
app.use(errorHandler);

module.exports = app;
