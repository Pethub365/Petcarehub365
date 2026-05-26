const express = require('express');
const router = express.Router();
const familyController = require('../controllers/family.controller');
const { auth } = require('../middleware/auth');

router.use(auth());

router.route('/')
  .get(familyController.getFamilyGroup);

router.post('/create', familyController.createFamilyGroup);
router.post('/invite', familyController.inviteMember);
router.post('/join', familyController.joinFamily);
router.put('/quests/:questId/assign', familyController.assignQuest);

module.exports = router;
