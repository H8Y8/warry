/**
 * 錯誤處理中間件
 * 處理應用程序中的各種錯誤
 */

/**
 * 自定義錯誤響應類
 * 用於創建具有狀態碼和消息的錯誤
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * 錯誤處理中間件
 * 處理並格式化各種類型的錯誤響應
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // 記錄錯誤
  console.error(err);
  
  // Mongoose 錯誤處理
  
  // 無效的ObjectId
  if (err.name === 'CastError') {
    const message = `找不到ID為 ${err.value} 的資源`;
    error = new ErrorResponse(message, 404);
  }
  
  // 重複鍵錯誤
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} 已被使用，請使用其他值`;
    error = new ErrorResponse(message, 400);
  }
  
  // Mongoose 驗證錯誤
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }
  
  // JWT 錯誤
  if (err.name === 'JsonWebTokenError') {
    error = new ErrorResponse('無效的認證令牌', 401);
  }
  
  // JWT 過期錯誤
  if (err.name === 'TokenExpiredError') {
    error = new ErrorResponse('認證令牌已過期', 401);
  }
  
  // 發送錯誤響應
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '伺服器錯誤'
  });
};

module.exports = {
  ErrorResponse,
  errorHandler
}; 