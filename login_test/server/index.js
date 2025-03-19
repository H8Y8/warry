const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// 連接資料庫
connectDB();

const app = express();

// 中間件
app.use(cors({
  origin: 'http://localhost:3000', // 前端應用的URL
  credentials: true, // 允許攜帶認證信息（cookies等）
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允許的HTTP方法
  allowedHeaders: ['Content-Type', 'Authorization'] // 允許的請求頭
}));
app.use(express.json());

// 路由
app.use('/api/users', require('./routes/userRoutes')); // 使用 /api/users 作為前綴

// 處理 404 錯誤
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: '找不到請求的資源'
  });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: '伺服器內部錯誤'
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`伺服器運行在端口 ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
});
