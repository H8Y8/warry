const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const protect = async (req, res, next) => {
  let token;

  // 檢查請求頭中是否有 token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 獲取 token
      token = req.headers.authorization.split(' ')[1];
      
      // 驗證 token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 通過 id 找到用戶，但不包含密碼
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: '未經授權，token 無效' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: '未經授權，沒有提供 token' });
  }
};

module.exports = { protect }; 