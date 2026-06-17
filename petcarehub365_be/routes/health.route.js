const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');
const { auth } = require('../middleware/auth');

router.use(auth());

router.route('/logs/:logId')
  .delete(healthController.deleteHealthLog);

router.route('/vaccines/:vaccineId')
  .delete(healthController.deleteVaccine);

router.route('/:petId/logs')
  .get(healthController.getHealthLogs)
  .post(healthController.addHealthLog);

router.route('/:petId/vaccines')
  .get(healthController.getVaccines)
  .post(healthController.addVaccine);

module.exports = router;
