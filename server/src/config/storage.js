/**
 * 檔案儲存配置模組
 * 提供文件上傳和存儲相關的配置
 */

const path = require('path');
const multer = require('multer');
const fs = require('fs');

// 上傳路徑
const uploadPath = process.env.UPLOAD_PATH || 'uploads';
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 預設5MB

// 確保上傳目錄存在
const ensureUploadDirExists = () => {
  const uploadDir = path.resolve(uploadPath);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // 創建子目錄
  const subDirs = ['products', 'receipts', 'warranties', 'profiles'];
  subDirs.forEach(dir => {
    const subDir = path.join(uploadDir, dir);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
  });
  
  return uploadDir;
};

// 配置Multer存儲
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = ensureUploadDirExists();
    
    // 根據文件類型選擇不同的子目錄
    let targetDir = uploadDir;
    if (file.fieldname === 'productImage') {
      targetDir = path.join(uploadDir, 'products');
    } else if (file.fieldname === 'receipt') {
      targetDir = path.join(uploadDir, 'receipts');
    } else if (file.fieldname === 'warrantyDocument') {
      targetDir = path.join(uploadDir, 'warranties');
    } else if (file.fieldname === 'profilePicture') {
      targetDir = path.join(uploadDir, 'profiles');
    }
    
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名: 時間戳-原始文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${fileExt}`);
  }
});

// 文件過濾器
const fileFilter = (req, file, cb) => {
  // 允許的文件類型
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (file.fieldname === 'productImage' || file.fieldname === 'profilePicture') {
    // 圖片文件
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的圖片格式。請上傳 JPG, PNG, GIF 或 WEBP 格式的圖片。'), false);
    }
  } else if (file.fieldname === 'receipt' || file.fieldname === 'warrantyDocument') {
    // 文檔文件
    if ([...allowedImageTypes, ...allowedDocTypes].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件格式。請上傳 PDF, DOC, DOCX 或圖片格式的文件。'), false);
    }
  } else {
    cb(null, true);
  }
};

// 創建Multer上傳實例
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize
  }
});

module.exports = {
  upload,
  uploadPath,
  ensureUploadDirExists
}; 