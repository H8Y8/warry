const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 生成 JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    註冊新用戶
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 檢查用戶是否已存在
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: '用戶已存在' });
    }

    // 創建新用戶
    const user = await User.create({
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: '無效的用戶數據' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

// @desc    用戶登入
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        status: 'error',
        message: '請提供電子郵件和密碼'
      });
    }

    // 檢查用戶是否存在並驗證密碼
    const user = await User.findOne({ email }).select('+password');
    const isValidPassword = user ? await user.matchPassword(password) : false;
    
    if (!user || !isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: '錯誤的電子郵件或密碼'
      });
    }

    // 登入成功
    const token = generateToken(user._id);
    
    res.status(200).json({
      status: 'success',
      token,
      user: {
        _id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: '伺服器內部錯誤'
    });
  }
};

// @desc    獲取當前用戶資訊
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '找不到用戶'
      });
    }

    res.status(200).json({
      status: 'success',
      user: {
        _id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: '伺服器內部錯誤'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
