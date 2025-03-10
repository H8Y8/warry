/**
 * 用戶路由
 * 處理用戶資料管理
 */

const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  updateUserSettings,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadProfilePicture } = require('../middleware/upload');

// 所有路由都需要認證
router.use(protect);

// 獲取用戶資料
router.get('/profile', getUserProfile);

// 更新用戶資料
router.put('/profile', uploadProfilePicture, updateUserProfile);

// 更新用戶設置
router.put('/settings', updateUserSettings);

// 刪除用戶
router.delete('/', deleteUser);

module.exports = router; 