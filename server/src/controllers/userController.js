/**
 * 用戶控制器
 * 處理用戶資料管理
 */

const User = require('../models/User');
const { ErrorResponse } = require('../middleware/error');
const { processAvatar } = require('../utils/imageProcessor');
const fs = require('fs').promises;
const path = require('path');
const { asyncHandler } = require('../middleware/async');

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

/**
 * 更改密碼
 * @route PUT /api/users/change-password
 * @access Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 驗證請求
    if (!oldPassword || !newPassword) {
      return next(new ErrorResponse('請提供當前密碼和新密碼', 400));
    }

    // 獲取用戶（包含密碼字段）
    const user = await User.findById(req.user.id).select('+password');

    // 驗證舊密碼
    if (!(await user.matchPassword(oldPassword))) {
      return res.status(401).json({
        success: false,
        message: '當前密碼不正確'
      });
    }

    // 更新密碼
    user.password = newPassword;
    await user.save(); // 這裡會觸發pre save中間件來加密新密碼

    res.status(200).json({
      success: true,
      message: '密碼已成功更新'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新用戶頭像
 * @route POST /api/users/avatar
 * @access Private
 */
exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('請上傳頭像文件', 400));
    }

    // 處理圖片
    const avatarFilename = await processAvatar(req.file);

    // 獲取用戶
    const user = await User.findById(req.user.id);

    // 如果用戶已有頭像，刪除舊文件
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../public/uploads/avatars', user.avatar);
      try {
        await fs.unlink(oldAvatarPath);
      } catch (error) {
        console.error('刪除舊頭像失敗:', error);
      }
    }

    // 更新用戶頭像
    user.avatar = avatarFilename;
    await user.save();

    // 刪除原始上傳文件
    try {
      await fs.unlink(req.file.path);
    } catch (error) {
      console.error('刪除原始上傳文件失敗:', error);
    }

    res.status(200).json({
      success: true,
      avatar: avatarFilename,
      message: '頭像更新成功'
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
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, email } = req.body;

    // 檢查郵箱是否已被其他用戶使用
    const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existingUser) {
      return next(new ErrorResponse('此電子郵件已被使用', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, email },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user,
      message: '個人資料更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    獲取用戶通知設定
 * @route   GET /api/users/notification-settings
 * @access  Private
 */
exports.getNotificationSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('notificationSettings email');

  if (!user) {
    res.status(404);
    throw new Error('找不到用戶');
  }

  // 如果用戶尚未設置通知設定，返回默認設定
  if (!user.notificationSettings) {
    const defaultSettings = {
      enabled: true,
      notificationEmail: '',
      useAccountEmail: true,
      notifyBefore: 30,
      frequency: 'once',
      notifyOnExpiry: true,
      notifyAfterExpiry: true
    };

    // 更新用戶設置默認設定
    await User.findByIdAndUpdate(
      req.user.id,
      { $set: { notificationSettings: defaultSettings } },
      { new: false, runValidators: false }
    );

    res.status(200).json({
      success: true,
      data: defaultSettings
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: user.notificationSettings
  });
});

/**
 * @desc    更新用戶通知設定
 * @route   PUT /api/users/notification-settings
 * @access  Private
 */
exports.updateNotificationSettings = asyncHandler(async (req, res) => {
  const {
    enabled,
    notificationEmail,
    useAccountEmail,
    notifyBefore,
    frequency,
    notifyOnExpiry,
    notifyAfterExpiry
  } = req.body;

  // 驗證自定義郵箱格式 (如果提供)
  if (!useAccountEmail && notificationEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(notificationEmail)) {
      res.status(400);
      throw new Error('請提供有效的郵箱地址');
    }
  }

  // 構建通知設定對象
  const notificationSettings = {
    enabled: enabled !== undefined ? enabled : true,
    notificationEmail: notificationEmail || '',
    useAccountEmail: useAccountEmail !== undefined ? useAccountEmail : true,
    notifyBefore: notifyBefore || 30,
    frequency: frequency || 'once',
    notifyOnExpiry: notifyOnExpiry !== undefined ? notifyOnExpiry : true,
    notifyAfterExpiry: notifyAfterExpiry !== undefined ? notifyAfterExpiry : true
  };

  // 使用 $set 只更新通知設定部分
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { notificationSettings } },
    { new: true, runValidators: false }
  );

  if (!user) {
    res.status(404);
    throw new Error('找不到用戶');
  }

  res.status(200).json({
    success: true,
    data: user.notificationSettings,
    message: '通知設定已成功更新'
  });
}); 