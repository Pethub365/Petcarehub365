const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { Notification } = require('../models');

exports.getNotifications = catchAsync(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
        Notification.find({ user_id: req.user._id })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Notification.countDocuments({ user_id: req.user._id }),
    ]);

    res.json({
        success: true,
        data: {
            notifications,
            pagination: { page: parseInt(page), limit: parseInt(limit), total },
        },
    });
});

exports.getUnreadCount = catchAsync(async (req, res) => {
    const count = await Notification.countDocuments({ user_id: req.user._id, is_read: false });
    res.json({ success: true, data: count });
});

exports.markAllAsRead = catchAsync(async (req, res) => {
    await Notification.updateMany({ user_id: req.user._id, is_read: false }, { is_read: true, read_at: new Date() });
    res.json({ success: true, message: 'All notifications marked as read' });
});

exports.markAsRead = catchAsync(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user._id },
        { is_read: true, read_at: new Date() },
        { new: true }
    );
    if (!notification) throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
    res.json({ success: true, data: { notification } });
});

exports.deleteNotification = catchAsync(async (req, res) => {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!notification) throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
    res.json({ success: true, message: 'Notification deleted' });
});
