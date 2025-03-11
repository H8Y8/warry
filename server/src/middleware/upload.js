/**
 * 文件上傳中間件
 * 處理各種類型的文件上傳
 */

const { upload } = require('../config/storage');
const { ErrorResponse } = require('./error');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * 處理單個產品圖片上傳
 */
exports.uploadProductImage = upload.single('productImage');

/**
 * 處理多個產品圖片上傳
 */
exports.uploadProductImages = upload.array('productImages', 5); // 最多5張圖片

/**
 * 處理收據上傳
 */
exports.uploadReceipt = upload.single('receipt');

/**
 * 處理保固文件上傳
 */
exports.uploadWarrantyDocument = upload.single('warrantyDocument');

/**
 * 處理個人資料圖片上傳
 */
exports.uploadProfilePicture = upload.single('profilePicture');

/**
 * 處理AI分析的產品圖片上傳
 */
exports.uploadAIAnalysisImage = upload.single('aiAnalysisImage');

/**
 * 文件上傳錯誤處理
 */
exports.handleUploadError = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return next(new ErrorResponse('文件大小超過限制', 400));
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return next(new ErrorResponse('意外的文件字段', 400));
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return next(new ErrorResponse('文件數量超過限制', 400));
  }
  
  if (err.message) {
    return next(new ErrorResponse(err.message, 400));
  }
  
  next(err);
};

// 確保上傳目錄存在
const ensureUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/products',
    'uploads/receipts',
    'uploads/warranties',
    'uploads/profiles'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // 確保預設圖片存在
  const defaultImagePath = path.join('uploads/products', 'default-product-image.jpg');
  if (!fs.existsSync(defaultImagePath)) {
    // 創建一個基本的預設圖片（1x1像素的透明圖片）
    const defaultImage = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    fs.writeFileSync(defaultImagePath, defaultImage);
  }
};

// 初始化上傳目錄
ensureUploadDirs();

// 配置Multer存儲
const storage = multer.diskStorage({
  // ... existing code ...
}); 