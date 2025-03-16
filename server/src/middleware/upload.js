/**
 * 文件上傳中間件
 * 處理各種類型的文件上傳
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { ErrorResponse } = require('./error');

// 確保上傳目錄存在
const ensureUploadDirs = () => {
  const dirs = [
    'public/uploads',
    'public/uploads/products',
    'public/uploads/receipts',
    'public/uploads/warranties',
    'public/uploads/avatars'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '../../', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

// 初始化上傳目錄
ensureUploadDirs();

// 配置存儲
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    
    // 根據上傳類型選擇目錄
    switch(file.fieldname) {
      case 'avatar':
        uploadPath = path.join(__dirname, '../../public/uploads/avatars');
        break;
      case 'productImage':
      case 'productImages':
        uploadPath = path.join(__dirname, '../../public/uploads/products');
        break;
      case 'receipt':
        uploadPath = path.join(__dirname, '../../public/uploads/receipts');
        break;
      case 'warrantyDocument':
        uploadPath = path.join(__dirname, '../../public/uploads/warranties');
        break;
      default:
        uploadPath = path.join(__dirname, '../../public/uploads');
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件過濾器
const fileFilter = (req, file, cb) => {
  // 圖片文件的處理
  if (file.fieldname === 'avatar' || file.fieldname === 'productImage' || file.fieldname === 'productImages') {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('只允許上傳圖片文件！'), false);
      return;
    }
  }
  
  // 允許上傳
  cb(null, true);
};

// 創建 multer 實例
const multerUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

/**
 * 文件上傳錯誤處理
 */
const handleUploadError = (err, req, res, next) => {
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

// 導出所有上傳相關的中間件
module.exports = {
  handleUploadError,
  uploadProductImage: multerUpload.single('productImage'),
  uploadProductImages: multerUpload.array('productImages', 5),
  uploadReceipt: multerUpload.array('receipt', 5),
  uploadWarrantyDocument: multerUpload.array('warrantyDocument', 5),
  uploadAvatar: multerUpload.single('avatar'),
  uploadProfilePicture: multerUpload.single('profilePicture'),
  uploadAIAnalysisImage: multerUpload.single('aiAnalysisImage'),
  uploadMultipleFiles: multerUpload.fields([
    { name: 'productImages', maxCount: 5 },
    { name: 'receipt', maxCount: 5 },
    { name: 'warrantyDocument', maxCount: 5 }
  ])
}; 