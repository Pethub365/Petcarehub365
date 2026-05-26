const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { auth } = require('../middleware/auth');

router.use(auth());

router.post('/upgrade', subscriptionController.upgradeVip);

module.exports = router;
