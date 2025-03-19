const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

// 所有路由都在 /api/users 下
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/me', protect, getMe);

module.exports = router;
