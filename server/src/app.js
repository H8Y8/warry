/**
 * Express應用配置
 * 設置中間件、路由和錯誤處理
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// 創建Express應用
const app = express();

// 配置CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析JSON請求體
app.use(express.json());

// 解析URL編碼的請求體
app.use(express.urlencoded({ extended: true }));

// 靜態文件服務
app.use('/uploads', express.static('uploads'));

// API路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/ai', require('./routes/ai'));

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
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || '服務器內部錯誤';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

module.exports = app; 