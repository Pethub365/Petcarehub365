const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');

// Upgrade user account to VIP
exports.upgradeVip = catchAsync(async (req, res) => {
  const { package_type } = req.body; // MONTHLY or YEARLY
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy người dùng');
  }

  const daysToAdd = package_type === 'YEARLY' ? 365 : 30;
  
  // Calculate expiry date
  let currentExpire = user.vip_expires_at && user.vip_expires_at > new Date()
    ? user.vip_expires_at
    : new Date();

  user.is_vip = true;
  user.vip_expires_at = new Date(currentExpire.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  await user.save();

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Nâng cấp gói VIP Premium thành công! 🌟',
    data: {
      is_vip: user.is_vip,
      vip_expires_at: user.vip_expires_at
    }
  });
});
