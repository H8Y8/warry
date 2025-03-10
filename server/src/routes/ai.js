/**
 * AI分析路由
 * 處理產品圖片分析功能
 */

const express = require('express');
const router = express.Router();
const { analyzeProductImage } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { uploadAIAnalysisImage, handleUploadError } = require('../middleware/upload');

// 所有路由都需要認證
router.use(protect);

// 分析產品圖片
router.post('/analyze', uploadAIAnalysisImage, analyzeProductImage);

// 處理上傳錯誤
router.use(handleUploadError);

module.exports = router; 