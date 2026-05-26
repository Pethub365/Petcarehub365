const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile', auth(), userController.getProfile);
router.put('/profile', auth(), upload.single('avatar'), userController.updateProfile);

module.exports = router;
