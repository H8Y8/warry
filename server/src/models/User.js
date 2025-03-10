/**
 * 用戶模型
 * 定義用戶資料結構和方法
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtConfig, passwordConfig } = require('../config/auth');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '請提供用戶名'],
    unique: true,
    trim: true,
    minlength: [3, '用戶名至少需要3個字符'],
    maxlength: [20, '用戶名不能超過20個字符']
  },
  email: {
    type: String,
    required: [true, '請提供電子郵件'],
    unique: true,
    match: [
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      '請提供有效的電子郵件地址'
    ]
  },
  password: {
    type: String,
    required: [true, '請提供密碼'],
    minlength: [6, '密碼至少需要6個字符'],
    select: false // 查詢時默認不返回密碼
  },
  fullName: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    reminderDays: {
      type: Number,
      default: 7 // 默認提前7天提醒
    }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
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

// 保存前加密密碼
UserSchema.pre('save', async function(next) {
  // 只有在密碼被修改時才重新加密
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(passwordConfig.saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 比較密碼
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 生成JWT令牌
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, username: this.username },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.expiresIn,
      algorithm: jwtConfig.algorithm,
      issuer: jwtConfig.issuer
    }
  );
};

// 生成重置密碼令牌
UserSchema.methods.getResetPasswordToken = function() {
  // 生成令牌
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // 加密令牌並設置到resetPasswordToken字段
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // 設置過期時間 - 10分鐘
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

module.exports = mongoose.model('User', UserSchema); 