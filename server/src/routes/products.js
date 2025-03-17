/**
 * 產品路由
 * 處理產品的CRUD操作
 */

const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  uploadProductFile,
  deleteProductFile,
  getProductStats,
  getWarrantyAlerts
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const {
  uploadProductImages,
  uploadProductImage: uploadSingleProductImage,
  uploadReceipt,
  uploadWarrantyDocument,
  handleUploadError,
  uploadMultipleFiles
} = require('../middleware/upload');

// 所有路由都需要認證
router.use(protect);

// 獲取保固提醒
router.get('/warranty-alerts', getWarrantyAlerts);

// 獲取產品統計數據
router.get('/stats', getProductStats);

// 獲取所有產品 / 創建產品
router
  .route('/')
  .get(getProducts)
  .post(uploadMultipleFiles, createProduct);

// 獲取單個產品 / 更新產品 / 刪除產品
router
  .route('/:id')
  .get(getProduct)
  .put(uploadProductImages, updateProduct)
  .delete(deleteProduct);

// 上傳產品圖片
router.post('/:id/upload', uploadSingleProductImage, uploadProductImage);

// 上傳收據和保固文件
router.post('/:id/upload-receipt', uploadReceipt, uploadProductFile);
router.post('/:id/upload-warranty', uploadWarrantyDocument, uploadProductFile);

// 刪除產品圖片
router.delete('/:id/images/:imageIndex', deleteProductImage);

// 刪除收據和保固文件
router.delete('/:id/files/:type/:fileIndex', deleteProductFile);

// 處理上傳錯誤
router.use(handleUploadError);

module.exports = router; 