const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { auth } = require('../middleware/auth');

// Tất cả routes đều yêu cầu đăng nhập
router.use(auth());

// GET /api/v1/subscriptions/plans        → Danh sách gói + trạng thái user
router.get('/plans', subscriptionController.getPlans);

// GET /api/v1/subscriptions/me           → Thông tin gói hiện tại
router.get('/me', subscriptionController.getMySubscription);

// GET /api/v1/subscriptions/transactions → Lịch sử giao dịch
router.get('/transactions', subscriptionController.getTransactions);

// POST /api/v1/subscriptions/upgrade     → Nâng cấp gói
router.post('/upgrade', subscriptionController.upgradeSubscription);

// POST /api/v1/subscriptions/cancel      → Huỷ gia hạn tự động
router.post('/cancel', subscriptionController.cancelAutoRenew);

module.exports = router;
