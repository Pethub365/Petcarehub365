const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { auth } = require('../middleware/auth');

router.use(auth()); // Đăng nhập mới có thể truy cập

router.get('/stats', adminController.getStats);

module.exports = router;
