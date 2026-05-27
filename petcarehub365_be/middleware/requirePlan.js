const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const PLAN_RANK = { FREE: 0, PREMIUM: 1, VIP: 2 };

/**
 * Middleware: Yêu cầu user phải có gói >= minimumPlan.
 * Dùng denormalized field `user.subscription_plan` để check nhanh.
 *
 * @example
 * // Chỉ VIP mới được truy cập
 * router.get('/ai-analysis', auth(), requirePlan('VIP'), controller.getAiAnalysis);
 *
 * // Premium trở lên
 * router.get('/unlimited-storage', auth(), requirePlan('PREMIUM'), controller.getStorage);
 */
const requirePlan = (minimumPlan) => (req, res, next) => {
    if (!req.user) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Bạn cần đăng nhập'));
    }

    const userPlan = req.user.subscription_plan || 'FREE';
    const userRank = PLAN_RANK[userPlan] ?? 0;
    const requiredRank = PLAN_RANK[minimumPlan] ?? 0;

    // Kiểm tra gói hết hạn (real-time guard)
    if (userPlan !== 'FREE') {
        const expiresAt = req.user.subscription_expires_at;
        if (expiresAt && new Date(expiresAt) < new Date()) {
            return next(new ApiError(
                httpStatus.PAYMENT_REQUIRED,
                `Gói ${userPlan} của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng tính năng này.`,
                { code: 'SUBSCRIPTION_EXPIRED', plan_expired: userPlan }
            ));
        }
    }

    if (userRank < requiredRank) {
        return next(new ApiError(
            httpStatus.PAYMENT_REQUIRED,
            `Tính năng này yêu cầu gói ${minimumPlan} trở lên. Vui lòng nâng cấp để sử dụng.`,
            { code: 'UPGRADE_REQUIRED', required_plan: minimumPlan, current_plan: userPlan }
        ));
    }

    next();
};

module.exports = { requirePlan };
