/**
 * 認證中間件
 * 用於保護需要登入的路由
 */

const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config/auth');
const User = require('../models/User');

/**
 * 保護路由中間件
 * 驗證用戶是否已登入
 */
exports.protect = async (req, res, next) => {
  let token;
  
  // 從請求頭或Cookie中獲取令牌
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // 從Bearer令牌中提取
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // 從Cookie中提取
    token = req.cookies.token;
  }
  
  // 檢查令牌是否存在
  if (!token) {
    return res.status(401).json({
      success: false,
      error: '未授權訪問，請先登入'
    });
  }
  
  try {
    // 驗證令牌
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // 獲取用戶信息
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '找不到與此令牌關聯的用戶'
      });
    }
    
    // 將用戶信息添加到請求對象
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: '未授權訪問，令牌無效'
    });
  }
};

/**
 * 授權角色中間件
 * 限制特定角色的訪問
 * @param {...String} roles - 允許的角色列表
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        error: '禁止訪問此資源'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `用戶角色 ${req.user.role} 無權訪問此資源`
      });
    }
    
    next();
  };
}; 