const express = require('express');
const router = express.Router();
const weeklyQuestController = require('../controllers/weeklyQuest.controller');
const { auth } = require('../middleware/auth');

router.use(auth()); // Toàn bộ API yêu cầu đăng nhập

router.route('/')
    .get(weeklyQuestController.getWeeklyQuests);

router.route('/:id')
    .get(weeklyQuestController.getWeeklyQuestById);

router.route('/:id/complete')
    .patch(weeklyQuestController.completeWeeklyQuest);

module.exports = router;
