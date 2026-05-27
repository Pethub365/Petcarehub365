const express = require('express');
const router = express.Router();
const familyController = require('../controllers/family.controller');
const { auth } = require('../middleware/auth');
const { requirePlan } = require('../middleware/requirePlan');

router.use(auth());

router.route('/')
  .get(familyController.getFamilyGroup);

router.post('/create', requirePlan('VIP'), familyController.createFamilyGroup);
router.post('/invite', requirePlan('VIP'), familyController.inviteMember);
router.post('/join', familyController.joinFamily);
router.put('/quests/:questId/assign', familyController.assignQuest);

module.exports = router;
