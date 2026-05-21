const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const authValidation = require('../validations/auth.validation');

// Public routes
router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshTokens);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-otp', authController.verifyOtp);

// Protected routes
router.get('/me', auth(), authController.getMe);
router.post('/change-password', auth(), authController.changePassword);

module.exports = router;
