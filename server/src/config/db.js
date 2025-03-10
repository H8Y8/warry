/**
 * 資料庫連接配置模組
 * 負責建立與MongoDB的連接，並處理連接事件
 */

const mongoose = require('mongoose');

/**
 * 連接MongoDB資料庫
 * 使用環境變數中定義的連接字串
 * 自動處理重連邏輯
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB 連接成功: ${conn.connection.host}`);

    // 監聽連接事件
    mongoose.connection.on('error', err => {
      console.error(`MongoDB 連接錯誤: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB 連接斷開，嘗試重新連接...');
    });

    // 處理應用關閉時的資料庫連接關閉
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB 連接已關閉');
      process.exit(0);
    });

  } catch (error) {
    console.error(`MongoDB 連接失敗: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 