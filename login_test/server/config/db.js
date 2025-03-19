const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB 已連接: ${conn.connection.host}`);
  } catch (error) {
    console.error(`錯誤: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 