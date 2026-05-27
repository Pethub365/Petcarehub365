const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievement.controller');
const { auth } = require('../middleware/auth');

router.use(auth());

router.get('/', achievementController.getAchievements);

module.exports = router;
