/**
 * 提醒控制器
 * 處理保固提醒相關功能
 */

const Reminder = require('../models/Reminder');
const Product = require('../models/Product');
const { ErrorResponse } = require('../middleware/error');

/**
 * 獲取用戶的所有提醒
 * @route GET /api/reminders
 * @access Private
 */
exports.getReminders = async (req, res, next) => {
  try {
    // 構建查詢條件
    const query = { userId: req.user.id };
    
    // 過濾條件
    if (req.query.isRead !== undefined) {
      query.isRead = req.query.isRead === 'true';
    }
    
    // 排序
    const sort = { reminderDate: -1 };
    
    // 分頁
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Reminder.countDocuments(query);
    
    // 執行查詢
    const reminders = await Reminder.find(query)
      .populate({
        path: 'productId',
        select: 'name brand model type warrantyEndDate'
      })
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
      count: reminders.length,
      pagination,
      data: reminders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 獲取單個提醒
 * @route GET /api/reminders/:id
 * @access Private
 */
exports.getReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate({
      path: 'productId',
      select: 'name brand model type warrantyEndDate'
    });
    
    if (!reminder) {
      return next(new ErrorResponse(`找不到ID為${req.params.id}的提醒`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 標記提醒為已讀
 * @route PUT /api/reminders/:id/read
 * @access Private
 */
exports.markReminderAsRead = async (req, res, next) => {
  try {
    let reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!reminder) {
      return next(new ErrorResponse(`找不到ID為${req.params.id}的提醒`, 404));
    }
    
    reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 標記所有提醒為已讀
 * @route PUT /api/reminders/read-all
 * @access Private
 */
exports.markAllRemindersAsRead = async (req, res, next) => {
  try {
    await Reminder.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({
      success: true,
      message: '所有提醒已標記為已讀'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 刪除提醒
 * @route DELETE /api/reminders/:id
 * @access Private
 */
exports.deleteReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!reminder) {
      return next(new ErrorResponse(`找不到ID為${req.params.id}的提醒`, 404));
    }
    
    await reminder.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 獲取即將到期的保固
 * @route GET /api/reminders/upcoming
 * @access Private
 */
exports.getUpcomingWarranties = async (req, res, next) => {
  try {
    // 獲取用戶設置的提醒天數
    const reminderDays = req.user.settings.reminderDays || 7;
    
    // 計算日期範圍
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + reminderDays);
    
    // 查詢即將到期的產品
    const products = await Product.find({
      userId: req.user.id,
      warrantyEndDate: {
        $gte: today,
        $lte: futureDate
      }
    }).sort({ warrantyEndDate: 1 });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
}; 