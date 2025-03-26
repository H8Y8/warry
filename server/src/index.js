/**
 * 應用程序入口點
 * 負責啟動Express服務器並連接資料庫
 */

// 載入環境變數
require('dotenv').config();

// 引入依賴
const express = require('express');
const app = require('./app');
const connectDB = require('./config/db');
const { ensureUploadDirExists } = require('./config/storage');

// 設定端口
const PORT = process.env.PORT || 5000;

// 連接資料庫
connectDB();

// 確保上傳目錄存在
ensureUploadDirExists();

// 啟動服務器
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`服務器運行在${process.env.NODE_ENV}模式下，端口: ${PORT}`);
  console.log('允許所有IP連線');
  console.log('已開放 VPN 網段 (192.168.100.0/24) 存取');
});

// 處理未捕獲的異常
process.on('uncaughtException', (err) => {
  console.error('未捕獲的異常:', err);
  // 記錄錯誤後優雅地關閉服務器
  server.close(() => {
    process.exit(1);
  });
});

// 處理未處理的Promise拒絕
process.on('unhandledRejection', (err) => {
  console.error('未處理的Promise拒絕:', err);
  // 記錄錯誤後優雅地關閉服務器
  server.close(() => {
    process.exit(1);
  });
});
