/**
 * 認證路由
 * 處理用戶註冊、登入、密碼重置等
 */

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// 註冊新用戶
router.post('/register', register);

// 用戶登入
router.post('/login', login);

// 用戶登出
router.get('/logout', logout);

// 獲取當前用戶
router.get('/me', protect, getMe);

// 忘記密碼
router.post('/forgot-password', forgotPassword);

// 重置密碼
router.put('/reset-password/:resettoken', resetPassword);

// 更新密碼
router.put('/update-password', protect, updatePassword);

module.exports = router; 