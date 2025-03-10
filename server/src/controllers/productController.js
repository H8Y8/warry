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
    // 添加用戶ID到請求體
    req.body.userId = req.user.id;
    
    // 處理上傳的圖片
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => `/uploads/products/${file.filename}`);
    }
    
    const product = await Product.create(req.body);
    
    // 創建保固提醒
    await Reminder.createWarrantyReminder(product, req.user);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
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