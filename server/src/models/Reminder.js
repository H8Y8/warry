/**
 * 提醒模型
 * 定義保固提醒資料結構和方法
 */

const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  reminderDate: {
    type: Date,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isSent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  },
  message: {
    type: String,
    required: true
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

// 索引設置，用於查詢優化
ReminderSchema.index({ userId: 1 });
ReminderSchema.index({ productId: 1 });
ReminderSchema.index({ reminderDate: 1 });
ReminderSchema.index({ isRead: 1 });
ReminderSchema.index({ isSent: 1 });

/**
 * 創建產品保固到期提醒
 * @param {Object} product - 產品對象
 * @param {Object} user - 用戶對象
 * @returns {Promise} 創建的提醒對象
 */
ReminderSchema.statics.createWarrantyReminder = async function(product, user) {
  // 計算提醒日期 (保固到期前X天)
  const reminderDays = user.settings.reminderDays || 7;
  const warrantyEndDate = new Date(product.warrantyEndDate);
  const reminderDate = new Date(warrantyEndDate);
  reminderDate.setDate(reminderDate.getDate() - reminderDays);
  
  // 如果提醒日期已經過去，則不創建提醒
  if (reminderDate < new Date()) {
    return null;
  }
  
  // 創建提醒消息
  const message = `您的產品 "${product.name}" 的保固將在 ${reminderDays} 天後到期。`;
  
  // 檢查是否已存在相同的提醒
  const existingReminder = await this.findOne({
    userId: user._id,
    productId: product._id,
    reminderDate: {
      $gte: new Date(reminderDate.setHours(0, 0, 0, 0)),
      $lt: new Date(reminderDate.setHours(23, 59, 59, 999))
    }
  });
  
  if (existingReminder) {
    return existingReminder;
  }
  
  // 創建新提醒
  return this.create({
    userId: user._id,
    productId: product._id,
    reminderDate,
    message
  });
};

/**
 * 獲取待發送的提醒
 * @returns {Promise} 待發送提醒的數組
 */
ReminderSchema.statics.getPendingReminders = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    reminderDate: {
      $gte: today,
      $lt: tomorrow
    },
    isSent: false
  }).populate('userId').populate('productId');
};

module.exports = mongoose.model('Reminder', ReminderSchema); 