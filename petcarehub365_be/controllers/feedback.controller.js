const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { Feedback } = require('../models');

// 1. Submit feedback
exports.submitFeedback = catchAsync(async (req, res) => {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Đánh giá phải từ 1 đến 5 sao');
    }

    const feedback = await Feedback.create({
        user_id: req.user._id,
        rating: Number(rating),
        comment: comment || '',
    });

    res.status(httpStatus.CREATED).json({
        success: true,
        message: 'Cảm ơn bạn đã gửi đánh giá phản hồi! ❤️',
        data: feedback
    });
});

// 2. Get feedbacks list (Admin only)
exports.getFeedbacks = catchAsync(async (req, res) => {
    const isAdmin = req.user.email.toLowerCase().includes('admin');
    if (!isAdmin) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Quyền truy cập bị từ chối');
    }

    const feedbacks = await Feedback.find()
        .populate('user_id', 'email username profile.full_name')
        .sort({ created_at: -1 })
        .limit(100);

    res.json({
        success: true,
        data: { feedbacks }
    });
});

// 3. Get feedback statistics (Admin only)
exports.getFeedbackStats = catchAsync(async (req, res) => {
    const isAdmin = req.user.email.toLowerCase().includes('admin');
    if (!isAdmin) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Quyền truy cập bị từ chối');
    }

    const total = await Feedback.countDocuments();

    const ratingStats = await Feedback.aggregate([
        {
            $group: {
                _id: '$rating',
                count: { $sum: 1 }
            }
        }
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingStats.forEach(item => {
        if (item._id && distribution[item._id] !== undefined) {
            distribution[item._id] = item.count;
        }
    });

    const totalStars = Object.entries(distribution).reduce((sum, [rating, count]) => sum + (Number(rating) * count), 0);
    const averageRating = total > 0 ? Number((totalStars / total).toFixed(2)) : 0;

    res.json({
        success: true,
        data: {
            total,
            averageRating,
            distribution
        }
    });
});
