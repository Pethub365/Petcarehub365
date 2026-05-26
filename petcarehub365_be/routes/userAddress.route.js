const express = require('express');
const router = express.Router();
const userAddressController = require('../controllers/userAddress.controller');
const { auth } = require('../middleware/auth');

router.get('/', auth(), userAddressController.getAddresses);
router.get('/:uuid', auth(), userAddressController.getAddress);
router.post('/', auth(), userAddressController.createAddress);
router.put('/:uuid', auth(), userAddressController.updateAddress);
router.delete('/:uuid', auth(), userAddressController.deleteAddress);
router.put('/:uuid/default', auth(), userAddressController.setDefaultAddress);

module.exports = router;
