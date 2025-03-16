/**
 * 異步處理中間件
 * 用於處理異步函數的錯誤捕獲
 */

// 異步處理包裝器，統一處理 try-catch
exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}; 