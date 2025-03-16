/**
 * 認證控制器
 * 處理用戶註冊、登入、密碼重置等功能
 */

const crypto = require('crypto');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/error');
const { cookieConfig } = require('../config/auth');

/**
 * 註冊新用戶
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    // 檢查用戶是否已存在
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return next(new ErrorResponse('用戶名或電子郵件已被使用', 400));
    }
    
    // 創建用戶
    const user = await User.create({
      username,
      email,
      password,
      fullName
    });
    
    // 發送令牌響應
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * 用戶登入
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // 驗證輸入
    if (!email || !password) {
      return next(new ErrorResponse('請提供電子郵件和密碼', 400));
    }
    
    // 檢查用戶是否存在
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return next(new ErrorResponse('找不到此電子郵件帳號', 401));
    }
    
    // 檢查密碼是否匹配
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return next(new ErrorResponse('密碼錯誤', 401));
    }
    
    // 發送令牌響應
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * 用戶登出
 * @route GET /api/auth/logout
 * @access Private
 */
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // 10秒後過期
      httpOnly: true
    });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 獲取當前登入用戶
 * @route GET /api/auth/me
 * @access Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 忘記密碼
 * @route POST /api/auth/forgot-password
 * @access Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return next(new ErrorResponse('沒有與該電子郵件關聯的用戶', 404));
    }
    
    // 獲取重置令牌
    const resetToken = user.getResetPasswordToken();
    
    await user.save({ validateBeforeSave: false });
    
    // 創建重置URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    
    const message = `您收到此電子郵件是因為您（或其他人）請求重置密碼。請點擊以下鏈接重置密碼：\n\n${resetUrl}`;
    
    try {
      // 在實際應用中，這裡應該發送電子郵件
      // await sendEmail({
      //   email: user.email,
      //   subject: '密碼重置令牌',
      //   message
      // });
      
      // 由於這是示例，我們只返回令牌
      res.status(200).json({
        success: true,
        data: {
          resetToken,
          message
        }
      });
    } catch (err) {
      console.error(err);
      
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      
      await user.save({ validateBeforeSave: false });
      
      return next(new ErrorResponse('無法發送電子郵件', 500));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 重置密碼
 * @route PUT /api/auth/reset-password/:resettoken
 * @access Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    // 獲取加密的令牌
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return next(new ErrorResponse('無效的令牌', 400));
    }
    
    // 設置新密碼
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    // 發送令牌響應
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * 更新密碼
 * @route PUT /api/auth/update-password
 * @access Private
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    
    // 檢查當前密碼
    if (!(await user.matchPassword(currentPassword))) {
      return next(new ErrorResponse('密碼不正確', 401));
    }
    
    user.password = newPassword;
    await user.save();
    
    // 發送令牌響應
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * 發送令牌響應
 * @param {Object} user - 用戶對象
 * @param {Number} statusCode - HTTP狀態碼
 * @param {Object} res - 響應對象
 */
const sendTokenResponse = (user, statusCode, res) => {
  // 創建令牌
  const token = user.getSignedJwtToken();
  
  // 設置Cookie選項
  const options = {
    ...cookieConfig,
    expires: new Date(
      Date.now() + cookieConfig.maxAge
    )
  };
  
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
}; 