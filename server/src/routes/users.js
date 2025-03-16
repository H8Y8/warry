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
  deleteUser,
  changePassword,
  updateAvatar,
  updateProfile,
  getNotificationSettings,
  updateNotificationSettings
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

// 所有路由都需要認證
router.use(protect);

// 獲取用戶資料
router.get('/profile', getUserProfile);

// 更新用戶資料
router.put('/profile', uploadAvatar, updateProfile);

// 更新用戶設置
router.put('/settings', updateUserSettings);

// 更改密碼
router.put('/change-password', changePassword);

// 刪除用戶
router.delete('/', deleteUser);

// 更新頭像
router.post('/avatar', uploadAvatar, updateAvatar);

// 添加通知設定路由
router.route('/notification-settings')
  .get(getNotificationSettings)
  .put(updateNotificationSettings);

module.exports = router; 