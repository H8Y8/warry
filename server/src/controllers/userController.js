/**
 * 用戶控制器
 * 處理用戶資料管理
 */

const User = require('../models/User');
const { ErrorResponse } = require('../middleware/error');

/**
 * 獲取用戶資料
 * @route GET /api/users/profile
 * @access Private
 */
exports.getUserProfile = async (req, res, next) => {
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
 * 更新用戶資料
 * @route PUT /api/users/profile
 * @access Private
 */
exports.updateUserProfile = async (req, res, next) => {
  try {
    // 允許更新的字段
    const fieldsToUpdate = {
      fullName: req.body.fullName
    };
    
    // 如果上傳了頭像，添加到更新字段
    if (req.file) {
      fieldsToUpdate.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新用戶設置
 * @route PUT /api/users/settings
 * @access Private
 */
exports.updateUserSettings = async (req, res, next) => {
  try {
    const { emailNotifications, reminderDays } = req.body;
    
    // 驗證提醒天數
    if (reminderDays !== undefined && (reminderDays < 1 || reminderDays > 90)) {
      return next(new ErrorResponse('提醒天數必須在1到90之間', 400));
    }
    
    // 構建設置對象
    const settings = {};
    
    if (emailNotifications !== undefined) {
      settings['settings.emailNotifications'] = emailNotifications;
    }
    
    if (reminderDays !== undefined) {
      settings['settings.reminderDays'] = reminderDays;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      settings,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 刪除用戶
 * @route DELETE /api/users
 * @access Private
 */
exports.deleteUser = async (req, res, next) => {
  try {
    // 在實際應用中，可能需要刪除與用戶相關的所有數據
    // 例如產品、提醒等
    
    await User.findByIdAndDelete(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
}; 