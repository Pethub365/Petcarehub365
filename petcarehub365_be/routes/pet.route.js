const express = require('express');
const router = express.Router();
const petController = require('../controllers/pet.controller');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(auth()); // Toàn bộ API pet yêu cầu đăng nhập

router.get('/leaderboard', petController.getLeaderboard);

router.route('/')
    .post(upload.single('avatar'), petController.createPet)
    .get(petController.getPets);

router.route('/:id')
    .get(petController.getPetById)
    .put(upload.single('avatar'), petController.updatePet)
    .delete(petController.deletePet);

module.exports = router;
