/**
 * 產品控制器
 * 處理產品的CRUD操作
 */

const Product = require('../models/Product');
const Reminder = require('../models/Reminder');
const { ErrorResponse } = require('../middleware/error');

/**
 * 獲取所有產品
 * @route GET /api/products
 * @access Private
 */
exports.getProducts = async (req, res, next) => {
  try {
    // 構建查詢條件
    const query = { userId: req.user.id };
    
    // 搜尋功能
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { model: searchRegex },
        { serialNumber: searchRegex },
        { brand: searchRegex }
      ];
    }
    
    // 過濾條件
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    if (req.query.brand) {
      query.brand = req.query.brand;
    }
    
    // 保固狀態過濾
    if (req.query.warranty === 'active') {
      query.warrantyEndDate = { $gt: new Date() };
    } else if (req.query.warranty === 'expired') {
      query.warrantyEndDate = { $lte: new Date() };
    }
    
    // 排序
    let sort = {};
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sort[field.substring(1)] = -1;
        } else {
          sort[field] = 1;
        }
      });
    } else {
      // 默認按創建時間降序排序
      sort = { createdAt: -1 };
    }
    
    // 分頁
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(query);
    
    // 執行查詢
    const products = await Product.find(query)
      .sort(sort)
      .skip(startIndex)
      .limit(limit);
    
    // 分頁結果
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 獲取單個產品
 * @route GET /api/products/:id
 * @access Private
 */
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!product) {
      return next(new ErrorResponse(`找不到ID為${req.params.id}的產品`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 創建產品
 * @route POST /api/products
 * @access Private
 */
exports.createProduct = async (req, res, next) => {
  try {
    console.log('開始處理產品創建請求');
    console.log('請求體:', req.body);
    console.log('上傳的文件:', req.files);
    
    // 添加用戶ID到請求體
    req.body.userId = req.user.id;
    
    // 處理上傳的產品圖片
    if (req.files && req.files.productImages) {
      console.log(`處理 ${req.files.productImages.length} 張產品圖片`);
      req.body.images = req.files.productImages.map(file => `/uploads/products/${file.filename}`);
      console.log('設置的產品圖片路徑:', req.body.images);
    }

    // 處理上傳的收據
    if (req.files && req.files.receipt) {
      console.log(`處理 ${req.files.receipt.length} 份收據`);
      req.body.receipts = req.files.receipt.map(file => `/uploads/receipts/${file.filename}`);
      console.log('設置的收據路徑:', req.body.receipts);
    }

    // 處理上傳的保固文件
    if (req.files && req.files.warrantyDocument) {
      console.log(`處理 ${req.files.warrantyDocument.length} 份保固文件`);
      req.body.warrantyDocuments = req.files.warrantyDocument.map(file => `/uploads/warranties/${file.filename}`);
      console.log('設置的保固文件路徑:', req.body.warrantyDocuments);
    }
    
    const product = await Product.create(req.body);
    console.log('創建的產品:', product);
    
    // 創建保固提醒
    await Reminder.createWarrantyReminder(product, req.user);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('創建產品時發生錯誤:', error);
    next(error);
  }
};

/**
 * 更新產品
 * @route PUT /api/products/:id
 * @access Private
 */
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!product) {
      return next(new ErrorResponse(`找不到ID為${req.params.id}的產品`, 404));
    }
    
    // 處理上傳的圖片
    if (req.files && req.files.length > 0) {
      // 如果已有圖片，則添加到現有圖片數組
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
      
      if (req.body.images) {
        if (Array.isArray(req.body.images)) {
          req.body.images = [...req.body.images, ...newImages];
        } else {
          req.body.images = [req.body.images, ...newImages];
        }
      } else {
        req.body.images = newImages;
      }
    }
    
    // 更新產品
    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    // 更新或創建保固提醒
    await Reminder.createWarrantyReminder(product, req.user);
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 刪除產品
 * @route DELETE /api/products/:id
 * @access Private
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!product) {
      return next(new ErrorResponse(`找不到ID為${req.params.id}的產品`, 404));
    }
    
    await product.remove();
    
    // 刪除相關的提醒
    await Reminder.deleteMany({ productId: req.params.id });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 上傳產品圖片
 * @route POST /api/products/:id/upload
 * @access Private
 */
exports.uploadProductImage = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!product) {
      return next(new ErrorResponse(`找不到ID為${req.params.id}的產品`, 404));
    }
    
    if (!req.file) {
      return next(new ErrorResponse('請上傳文件', 400));
    }
    
    const filePath = `/uploads/products/${req.file.filename}`;
    
    // 更新產品圖片
    if (!product.images) {
      product.images = [filePath];
    } else {
      product.images.push(filePath);
    }
    
    await product.save();
    
    res.status(200).json({
      success: true,
      data: {
        filePath,
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 刪除產品圖片
 * @route DELETE /api/products/:id/images/:imageIndex
 * @access Private
 */
exports.deleteProductImage = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!product) {
      return next(new ErrorResponse(`找不到ID為${req.params.id}的產品`, 404));
    }
    
    const imageIndex = parseInt(req.params.imageIndex);
    
    if (!product.images || !product.images[imageIndex]) {
      return next(new ErrorResponse('找不到指定的圖片', 404));
    }
    
    // 刪除圖片
    product.images.splice(imageIndex, 1);
    await product.save();
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 上傳產品相關文件
 * @route POST /api/products/:id/upload
 * @access Private
 */
exports.uploadProductFile = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!product) {
      return next(new ErrorResponse(`找不到ID為${req.params.id}的產品`, 404));
    }
    
    if (!req.file) {
      return next(new ErrorResponse('請上傳文件', 400));
    }
    
    // 根據文件類型決定存儲路徑
    let filePath;
    if (req.file.fieldname === 'receipt') {
      filePath = `/uploads/receipts/${req.file.filename}`;
      if (!product.receipts) {
        product.receipts = [filePath];
      } else {
        product.receipts.push(filePath);
      }
    } else if (req.file.fieldname === 'warrantyDocument') {
      filePath = `/uploads/warranties/${req.file.filename}`;
      if (!product.warrantyDocuments) {
        product.warrantyDocuments = [filePath];
      } else {
        product.warrantyDocuments.push(filePath);
      }
    } else {
      return next(new ErrorResponse('無效的文件類型', 400));
    }
    
    await product.save();
    
    res.status(200).json({
      success: true,
      data: {
        filePath,
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 刪除產品文件（收據或保固文件）
 * @route DELETE /api/products/:id/files/:type/:fileIndex
 * @access Private
 */
exports.deleteProductFile = async (req, res, next) => {
  try {
    const { id, type, fileIndex } = req.params;
    const index = parseInt(fileIndex, 10);

    // 驗證文件類型
    if (type !== 'receipt' && type !== 'warranty') {
      return next(new ErrorResponse('無效的文件類型，只能是 receipt 或 warranty', 400));
    }

    // 查找產品
    const product = await Product.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!product) {
      return next(new ErrorResponse(`找不到ID為${id}的產品`, 404));
    }

    // 確定要刪除的文件類型
    const fileArray = type === 'receipt' ? product.receipts : product.warrantyDocuments;

    // 檢查文件索引是否有效
    if (index < 0 || index >= fileArray.length) {
      return next(new ErrorResponse('無效的文件索引', 400));
    }

    // 獲取文件路徑
    const filePath = fileArray[index];

    // 從數組中移除文件
    fileArray.splice(index, 1);

    // 更新產品
    if (type === 'receipt') {
      product.receipts = fileArray;
    } else {
      product.warrantyDocuments = fileArray;
    }

    // 保存更改
    await product.save();

    // 嘗試刪除實際文件
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(__dirname, '../../', filePath);

    try {
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`成功刪除文件: ${fullPath}`);
      }
    } catch (err) {
      console.error(`刪除文件時發生錯誤: ${err.message}`);
      // 不中斷操作，即使文件刪除失敗
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('刪除文件時發生錯誤:', error);
    next(error);
  }
};

/**
 * 獲取產品統計數據
 * @route GET /api/products/stats
 * @access Private
 */
exports.getProductStats = async (req, res, next) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // 獲取總產品數量
    const totalProducts = await Product.countDocuments({ userId: req.user.id });

    // 獲取即將到期的產品數量（30天內）
    const expiringProducts = await Product.countDocuments({
      userId: req.user.id,
      warrantyEndDate: {
        $gt: today,
        $lte: thirtyDaysFromNow
      }
    });

    // 獲取已過期的產品數量
    const expiredProducts = await Product.countDocuments({
      userId: req.user.id,
      warrantyEndDate: { $lte: today }
    });

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        expiringProducts,
        expiredProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 獲取保固提醒
 * @route GET /api/products/warranty-alerts
 * @access Private
 */
exports.getWarrantyAlerts = async (req, res, next) => {
  try {
    // 獲取當前用戶的所有產品
    const products = await Product.find({ userId: req.user.id });
    
    // 計算每個產品的保固狀態
    const today = new Date();
    const alerts = products.map(product => {
      const endDate = new Date(product.warrantyEndDate);
      const diffTime = endDate - today;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // 確定狀態
      let status;
      if (daysLeft <= 0) {
        status = 'expired';
      } else if (daysLeft <= 30) {
        status = 'expiring';
      } else {
        status = 'active';
      }

      // 構建提醒對象
      return {
        id: product._id,
        productId: product._id,
        productName: product.name,
        brand: product.brand,
        type: product.type,
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        purchaseDate: product.purchaseDate,
        warrantyEndDate: product.warrantyEndDate,
        daysLeft: daysLeft,
        status: status
      };
    });

    res.status(200).json({
      success: true,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
}; 