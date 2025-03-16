/**
 * 保固路由
 * 處理保固相關功能
 */

const express = require('express');
const router = express.Router();
const { getWarrantyAlerts } = require('../controllers/warrantyController');
const { protect } = require('../middleware/auth');

// 所有路由都需要認證
router.use(protect);

// 獲取保固提醒
router.get('/alerts', getWarrantyAlerts);

module.exports = router; 