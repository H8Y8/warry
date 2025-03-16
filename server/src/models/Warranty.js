/**
 * 保固模型
 * 定義保固資料結構和方法
 */

const mongoose = require('mongoose');

const WarrantySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: {
    type: String,
    required: [true, '請提供產品名稱'],
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  warrantyDuration: {
    type: Number,
    required: [true, '請提供保固期限'],
    default: 365 // 預設一年
  },
  warrantyEndDate: {
    type: Date,
    required: true
  },
  remarks: {
    type: String,
    maxlength: [500, '備註不能超過500個字符']
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

// 保存前計算保固結束日期
WarrantySchema.pre('save', function(next) {
  if (this.isModified('purchaseDate') || this.isModified('warrantyDuration')) {
    const purchaseDate = new Date(this.purchaseDate);
    this.warrantyEndDate = new Date(purchaseDate.setDate(purchaseDate.getDate() + this.warrantyDuration));
  }
  next();
});

module.exports = mongoose.model('Warranty', WarrantySchema); 