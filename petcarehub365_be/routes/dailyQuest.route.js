const express = require('express');
const router = express.Router();
const dailyQuestController = require('../controllers/dailyQuest.controller');
const { auth } = require('../middleware/auth');

router.use(auth()); // Toàn bộ API daily quests yêu cầu đăng nhập

router.route('/')
    .get(dailyQuestController.getDailyQuests);

router.route('/:id')
    .get(dailyQuestController.getDailyQuestById);

router.route('/:id/complete')
    .patch(dailyQuestController.completeQuest);

module.exports = router;
