/**
 * 路由索引
 * 集中管理所有API路由
 */

const express = require('express');
const router = express.Router();

// 引入所有路由
const authRoutes = require('./auth');
const userRoutes = require('./users');
const warrantyRoutes = require('./warranties');

// 使用路由
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/warranties', warrantyRoutes);

module.exports = router; 