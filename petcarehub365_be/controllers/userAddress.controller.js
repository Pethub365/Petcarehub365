const httpStatus = require('http-status');
const { v4: uuidv4 } = require('uuid');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { UserAddress } = require('../models');

exports.getAddresses = catchAsync(async (req, res) => {
    const addresses = await UserAddress.find({ user_id: req.user._id });
    res.json({ success: true, data: { addresses } });
});

exports.getAddress = catchAsync(async (req, res) => {
    const address = await UserAddress.findOne({ uuid: req.params.uuid, user_id: req.user._id });
    if (!address) throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
    res.json({ success: true, data: { address } });
});

exports.createAddress = catchAsync(async (req, res) => {
    const { full_name, phone, address_line, ward, district, province, is_default } = req.body;

    if (is_default) {
        await UserAddress.updateMany({ user_id: req.user._id }, { is_default: false });
    }

    const address = await UserAddress.create({
        user_id: req.user._id,
        uuid: uuidv4(),
        full_name, phone, address_line, ward, district, province,
        is_default: is_default || false,
    });

    res.status(httpStatus.CREATED).json({ success: true, data: { address } });
});

exports.updateAddress = catchAsync(async (req, res) => {
    const address = await UserAddress.findOne({ uuid: req.params.uuid, user_id: req.user._id });
    if (!address) throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');

    if (req.body.is_default) {
        await UserAddress.updateMany({ user_id: req.user._id }, { is_default: false });
    }

    Object.assign(address, req.body);
    await address.save();

    res.json({ success: true, data: { address } });
});

exports.deleteAddress = catchAsync(async (req, res) => {
    const address = await UserAddress.findOneAndDelete({ uuid: req.params.uuid, user_id: req.user._id });
    if (!address) throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
    res.json({ success: true, message: 'Address deleted' });
});

exports.setDefaultAddress = catchAsync(async (req, res) => {
    await UserAddress.updateMany({ user_id: req.user._id }, { is_default: false });
    const address = await UserAddress.findOneAndUpdate(
        { uuid: req.params.uuid, user_id: req.user._id },
        { is_default: true },
        { new: true }
    );
    if (!address) throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
    res.json({ success: true, data: { address } });
});
