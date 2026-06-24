const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const { auth } = require('../middleware/auth');

router.use(auth()); // Require login for all feedback actions

router.post('/', feedbackController.submitFeedback);
router.get('/', feedbackController.getFeedbacks);
router.get('/stats', feedbackController.getFeedbackStats);

module.exports = router;
