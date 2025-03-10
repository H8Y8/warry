/**
 * 文件上傳中間件
 * 處理各種類型的文件上傳
 */

const { upload } = require('../config/storage');
const { ErrorResponse } = require('./error');

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