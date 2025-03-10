/**
 * 提醒路由
 * 處理保固提醒相關功能
 */

const express = require('express');
const router = express.Router();
const {
  getReminders,
  getReminder,
  markReminderAsRead,
  markAllRemindersAsRead,
  deleteReminder,
  getUpcomingWarranties
} = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

// 所有路由都需要認證
router.use(protect);

// 獲取所有提醒
router.get('/', getReminders);

// 獲取即將到期的保固
router.get('/upcoming', getUpcomingWarranties);

// 標記所有提醒為已讀
router.put('/read-all', markAllRemindersAsRead);

// 獲取單個提醒 / 刪除提醒
router
  .route('/:id')
  .get(getReminder)
  .delete(deleteReminder);

// 標記提醒為已讀
router.put('/:id/read', markReminderAsRead);

module.exports = router; 