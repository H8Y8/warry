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
  deleteProductImage
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const {
  uploadProductImages,
  uploadProductImage: uploadSingleProductImage,
  handleUploadError
} = require('../middleware/upload');

// 所有路由都需要認證
router.use(protect);

// 獲取所有產品 / 創建產品
router
  .route('/')
  .get(getProducts)
  .post(uploadProductImages, createProduct);

// 獲取單個產品 / 更新產品 / 刪除產品
router
  .route('/:id')
  .get(getProduct)
  .put(uploadProductImages, updateProduct)
  .delete(deleteProduct);

// 上傳產品圖片
router.post('/:id/upload', uploadSingleProductImage, uploadProductImage);

// 刪除產品圖片
router.delete('/:id/images/:imageIndex', deleteProductImage);

// 處理上傳錯誤
router.use(handleUploadError);

module.exports = router; 