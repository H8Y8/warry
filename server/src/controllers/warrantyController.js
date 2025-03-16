/**
 * 保固控制器
 * 處理保固相關功能
 */

const { asyncHandler } = require('../middleware/async');
const Warranty = require('../models/Warranty');

/**
 * @desc    獲取保固提醒列表
 * @route   GET /api/warranties/alerts
 * @access  Private
 */
exports.getWarrantyAlerts = asyncHandler(async (req, res) => {
  // 查詢用戶的所有保固
  const warranties = await Warranty.find({ user: req.user.id })
    .populate('product', 'name image');
  
  // 計算每個保固的剩餘天數和狀態
  const now = new Date();
  const alerts = warranties.map(warranty => {
    const endDate = new Date(warranty.warrantyEndDate);
    const diffTime = endDate - now;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let status;
    if (daysRemaining < 0) {
      status = 'expired';
    } else if (daysRemaining <= 30) {
      status = 'upcoming';
    } else {
      status = 'active';
    }
    
    return {
      id: warranty._id,
      productName: warranty.product ? warranty.product.name : warranty.productName,
      warrantyEndDate: warranty.warrantyEndDate.toISOString().split('T')[0],
      daysRemaining,
      status,
      image: warranty.product ? warranty.product.image : null
    };
  });
  
  res.status(200).json({
    success: true,
    count: alerts.length,
    data: alerts
  });
}); 