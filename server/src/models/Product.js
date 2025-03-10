/**
 * 產品模型
 * 定義產品資料結構和方法
 */

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, '請提供產品名稱'],
    trim: true,
    maxlength: [100, '產品名稱不能超過100個字符']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, '產品描述不能超過500個字符']
  },
  type: {
    type: String,
    required: [true, '請提供產品類型'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, '請提供產品品牌'],
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date,
    required: [true, '請提供購買日期']
  },
  warrantyEndDate: {
    type: Date,
    required: [true, '請提供保固截止日期']
  },
  images: [{
    type: String
  }],
  receipts: [{
    type: String
  }],
  warrantyDocuments: [{
    type: String
  }],
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 計算保固剩餘天數的虛擬屬性
ProductSchema.virtual('warrantyDaysLeft').get(function() {
  const today = new Date();
  const endDate = new Date(this.warrantyEndDate);
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// 判斷保固是否已過期的虛擬屬性
ProductSchema.virtual('isWarrantyExpired').get(function() {
  return this.warrantyDaysLeft === 0;
});

// 確保虛擬屬性在JSON輸出中可見
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

// 索引設置，用於查詢優化
ProductSchema.index({ userId: 1 });
ProductSchema.index({ warrantyEndDate: 1 });
ProductSchema.index({ brand: 1, type: 1 });

module.exports = mongoose.model('Product', ProductSchema); 