/**
 * 認證配置模組
 * 提供JWT相關的配置和工具函數
 */

/**
 * JWT配置選項
 */
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRE || '30d',
  algorithm: 'HS256',
  issuer: 'warranty-tracker-api'
};

/**
 * 密碼雜湊配置
 */
const passwordConfig = {
  saltRounds: 10 // bcrypt加密強度
};

/**
 * Cookie配置
 */
const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30天
};

module.exports = {
  jwtConfig,
  passwordConfig,
  cookieConfig
}; 