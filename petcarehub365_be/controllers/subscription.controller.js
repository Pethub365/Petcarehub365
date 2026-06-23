const httpStatus = require('http-status');
const { v4: uuidv4 } = require('uuid');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { User, Subscription, PaymentTransaction, Notification, FamilyGroup } = require('../models');
const sendEmail = require('../utils/sendEmail');

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const PLAN_PRICE = {
    PREMIUM: { MONTHLY: 49000, YEARLY: 49000 * 12 * 0.8 },
    VIP: { MONTHLY: 139000, YEARLY: 139000 * 12 * 0.8 },
};

const PLAN_RANK = { FREE: 0, PREMIUM: 1, VIP: 2 };

// ─────────────────────────────────────────────
// HELPER: Get or create subscription for user
// ─────────────────────────────────────────────
const getOrCreateSubscription = async (userId) => {
    let sub = await Subscription.findOne({ user_id: userId });
    if (!sub) {
        sub = await Subscription.create({
            user_id: userId,
            plan_type: 'FREE',
            status: 'ACTIVE',
            expires_at: null,
        });
    }
    return sub;
};

// ─────────────────────────────────────────────
// HELPER: Sync denormalized fields on User
// ─────────────────────────────────────────────
const syncUserPlan = async (userId, plan_type, expires_at) => {
    await User.findByIdAndUpdate(userId, {
        subscription_plan: plan_type,
        subscription_expires_at: expires_at,
        // Legacy fields giữ tương thích ngược
        is_vip: plan_type === 'VIP',
        vip_expires_at: plan_type === 'VIP' ? expires_at : null,
    });
};

// ─────────────────────────────────────────────
// HELPER: Send in-app + email notification
// ─────────────────────────────────────────────
const notifyUser = async (user, title, body, type = 'SUBSCRIPTION') => {
    try {
        await Notification.create({ user_id: user._id, title, body, type });
    } catch (_) { /* non-blocking */ }

    // Run sendEmail asynchronously in the background so it doesn't block the API response
    sendEmail({
        to: user.email,
        subject: title,
        html: `<div style="font-family:Arial,sans-serif;padding:20px;color:#333;">
            <h2 style="color:#EC4B4B;">🐾 PetCare Hub</h2>
            <p>${body}</p>
            <p style="color:#888;font-size:12px;">PetcareHub365 Team</p>
        </div>`,
    }).catch(err => {
        console.error('[Subscription Email] Failed to send email:', err.message);
    });
};

// ─────────────────────────────────────────────
// 1. GET /subscriptions/me
//    Lấy thông tin gói hiện tại của user
// ─────────────────────────────────────────────
exports.getMySubscription = catchAsync(async (req, res) => {
    const sub = await getOrCreateSubscription(req.user._id);

    // Kiểm tra hết hạn tại thời điểm request (real-time guard)
    if (sub.plan_type !== 'FREE' && sub.expires_at && sub.expires_at < new Date()) {
        if (sub.status !== 'EXPIRED') {
            await performDowngrade(req.user, sub);
        }
        await sub.reload?.() ?? (await sub.constructor.findById(sub._id).then(s => Object.assign(sub, s.toObject())));
    }

    res.json({
        success: true,
        data: {
            subscription: {
                plan_type: sub.plan_type,
                status: sub.status,
                started_at: sub.started_at,
                expires_at: sub.expires_at,
                auto_renew: sub.auto_renew,
                days_remaining: sub.expires_at
                    ? Math.max(0, Math.ceil((new Date(sub.expires_at) - new Date()) / (1000 * 60 * 60 * 24)))
                    : null,
            },
        },
    });
});

// ─────────────────────────────────────────────
// 2. GET /subscriptions/plans
//    Danh sách các gói + trạng thái user hiện tại
// ─────────────────────────────────────────────
exports.getPlans = catchAsync(async (req, res) => {
    const sub = await getOrCreateSubscription(req.user._id);

    const plans = [
        {
            plan_type: 'FREE',
            name: 'Gói Miễn Phí',
            price_monthly: 0,
            price_yearly: 0,
            features: [
                'Theo dõi sức khỏe cơ bản',

                'Xem thông tin cơ bản của thú cưng',
            ],
            is_current: sub.plan_type === 'FREE',
            can_upgrade: sub.plan_type !== 'FREE', // FREE không thể "nâng cấp" lên FREE
        },
        {
            plan_type: 'PREMIUM',
            name: 'Gói Premium',
            price_monthly: PLAN_PRICE.PREMIUM.MONTHLY,
            price_yearly: PLAN_PRICE.PREMIUM.YEARLY,
            features: [
                'Tất cả quyền lợi của gói Free',
                'Không quảng cáo',
                'Lưu trữ hồ sơ thú cưng không giới hạn',
            ],
            is_current: sub.plan_type === 'PREMIUM',
            can_upgrade: PLAN_RANK[sub.plan_type] < PLAN_RANK['PREMIUM'],
        },
        {
            plan_type: 'VIP',
            name: 'Gói VIP',
            price_monthly: PLAN_PRICE.VIP.MONTHLY,
            price_yearly: PLAN_PRICE.VIP.YEARLY,
            features: [
                'Tất cả quyền lợi của Premium',
                'Mở khóa hướng dẫn chuyên sâu',
                'Phân tích AI nâng cao',

                'Gói gia đình (Family Plan)',
                'Nhiệm vụ cá nhân hóa theo từng pet',
            ],
            is_current: sub.plan_type === 'VIP',
            can_upgrade: PLAN_RANK[sub.plan_type] < PLAN_RANK['VIP'],
        },
    ];

    res.json({ success: true, data: { plans, current_plan: sub.plan_type } });
});

// ─────────────────────────────────────────────
// 3. POST /subscriptions/upgrade
//    Nâng cấp gói (PREMIUM hoặc VIP), ghi lịch sử giao dịch
// ─────────────────────────────────────────────
exports.upgradeSubscription = catchAsync(async (req, res) => {
    const { plan_type, package_duration = 'MONTHLY', payment_method = 'MANUAL' } = req.body;

    // Validate plan
    if (!['PREMIUM', 'VIP'].includes(plan_type)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'plan_type phải là PREMIUM hoặc VIP');
    }
    if (!['MONTHLY', 'YEARLY'].includes(package_duration)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'package_duration phải là MONTHLY hoặc YEARLY');
    }

    const normalizedPaymentMethod = String(payment_method).toUpperCase();
    if (!['CARD', 'MOMO', 'ZALOPAY', 'VIETQR', 'MANUAL'].includes(normalizedPaymentMethod)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'payment_method không hợp lệ');
    }

    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy người dùng');

    const sub = await getOrCreateSubscription(user._id);

    // Chặn downgrade qua endpoint này
    if (PLAN_RANK[plan_type] <= PLAN_RANK[sub.plan_type] && sub.status === 'ACTIVE' && sub.expires_at > new Date()) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Bạn đang dùng gói ${sub.plan_type}. Không thể chuyển xuống gói thấp hơn qua đây.`
        );
    }

    // Tính ngày hết hạn mới
    const daysToAdd = package_duration === 'YEARLY' ? 365 : 30;
    const now = new Date();

    // Nếu đang còn hạn gói cũ → cộng thêm vào ngày hết hạn hiện tại
    const baseDate = (sub.expires_at && sub.expires_at > now) ? sub.expires_at : now;
    const newExpiresAt = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    // Tính tiền
    const amount = PLAN_PRICE[plan_type][package_duration];

    // Lưu gói cũ trước khi ghi đè
    const previousPlan = sub.plan_type;
    const previousExpiresAt = sub.expires_at;

    // Cập nhật Subscription
    sub.previous_plan = previousPlan;
    sub.previous_expires_at = previousExpiresAt;
    sub.plan_type = plan_type;
    sub.status = 'ACTIVE';
    sub.started_at = now;
    sub.expires_at = newExpiresAt;
    sub.downgraded_at = null;
    await sub.save();

    // Sync User (denormalized fields)
    await syncUserPlan(user._id, plan_type, newExpiresAt);

    // Ghi PaymentTransaction
    const txRef = `PCH-${uuidv4().slice(0, 8).toUpperCase()}`;
    const tx = await PaymentTransaction.create({
        user_id: user._id,
        subscription_id: sub._id,
        plan_type,
        package_duration,
        amount,
        status: 'SUCCESS',
        payment_method: normalizedPaymentMethod,
        transaction_ref: txRef,
        paid_at: now,
        subscription_start: now,
        subscription_end: newExpiresAt,
        description: `Nâng cấp lên gói ${plan_type} (${package_duration === 'MONTHLY' ? 'tháng' : 'năm'})`,
    });

    // Thông báo
    const planName = plan_type === 'VIP' ? 'VIP' : 'Premium';
    await notifyUser(
        user,
        `🌟 Nâng cấp gói ${planName} thành công!`,
        `Gói ${planName} của bạn đã được kích hoạt và có hiệu lực đến ${newExpiresAt.toLocaleDateString('vi-VN')}. Cảm ơn bạn đã tin tưởng PetCare Hub!`
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: `Nâng cấp gói ${planName} thành công! 🌟`,
        data: {
            subscription: {
                plan_type: sub.plan_type,
                status: sub.status,
                started_at: sub.started_at,
                expires_at: sub.expires_at,
            },
            transaction: {
                ref: tx.transaction_ref,
                amount: tx.amount,
                paid_at: tx.paid_at,
            },
            is_vip: plan_type === 'VIP',
            vip_expires_at: newExpiresAt,
        },
    });
});

// ─────────────────────────────────────────────
// 4. GET /subscriptions/transactions
//    Lịch sử giao dịch của user
// ─────────────────────────────────────────────
exports.getTransactions = catchAsync(async (req, res) => {
    const transactions = await PaymentTransaction.find({ user_id: req.user._id })
        .sort({ created_at: -1 })
        .limit(20);

    res.json({ success: true, data: { transactions } });
});

// ─────────────────────────────────────────────
// INTERNAL: Thực hiện downgrade user về FREE
// Được gọi bởi cron job hoặc real-time guard
// ─────────────────────────────────────────────
const performDowngrade = async (userOrId, sub) => {
    const user = typeof userOrId === 'object' && userOrId.email
        ? userOrId
        : await User.findById(userOrId);

    if (!user) return;

    // Nếu đang VIP và có FamilyGroup → revoke quyền Family Plan
    if (sub.plan_type === 'VIP') {
        try {
            // Không xóa group nhưng đánh dấu owner không còn VIP
            // Frontend sẽ kiểm tra quyền khi truy cập
            console.log(`[Subscription] Revoking VIP FamilyPlan access for user ${user._id}`);
        } catch (err) {
            console.error('[Subscription] Error revoking family plan:', err);
        }
    }

    const previousPlan = sub.plan_type;
    sub.previous_plan = previousPlan;
    sub.previous_expires_at = sub.expires_at;
    sub.plan_type = 'FREE';
    sub.status = 'EXPIRED';
    sub.expires_at = null;
    sub.downgraded_at = new Date();
    await sub.save();

    // Sync User
    await User.findByIdAndUpdate(user._id, {
        subscription_plan: 'FREE',
        subscription_expires_at: null,
        is_vip: false,
        vip_expires_at: null,
    });

    // Thông báo
    await notifyUser(
        user,
        `⚠️ Gói ${previousPlan} của bạn đã hết hạn`,
        `Tài khoản của bạn đã được chuyển về gói Miễn Phí. Các tính năng nâng cao tạm thời bị khoá. Nâng cấp lại bất cứ lúc nào để tiếp tục trải nghiệm đầy đủ!`
    );

    console.log(`[Subscription Cron] Downgraded user ${user._id} from ${previousPlan} → FREE`);
};

// Export để cron job và test dùng
exports.performDowngrade = performDowngrade;

// ─────────────────────────────────────────────
// 5. CRON: Kiểm tra và downgrade subscription hết hạn
//    Gọi từ jobs/subscriptionExpiry.js
// ─────────────────────────────────────────────
exports.runExpiryCheck = async () => {
    const now = new Date();
    console.log(`[Subscription Cron] Running expiry check at ${now.toISOString()}`);

    // Check near expiry subscriptions (warn users 3 days before expiration)
    try {
        await exports.checkNearExpirySubscriptions();
    } catch (err) {
        console.error('[Subscription Cron] Error warning expiring subs:', err);
    }

    // Tìm tất cả subscription non-FREE đã hết hạn và vẫn đang ACTIVE
    const expiredSubs = await Subscription.find({
        plan_type: { $in: ['PREMIUM', 'VIP'] },
        status: 'ACTIVE',
        expires_at: { $lte: now },
    }).populate('user_id');

    if (expiredSubs.length === 0) {
        console.log('[Subscription Cron] No expired subscriptions found.');
        return { processed: 0 };
    }

    let processed = 0;
    for (const sub of expiredSubs) {
        try {
            await performDowngrade(sub.user_id, sub);
            processed++;
        } catch (err) {
            console.error(`[Subscription Cron] Error processing sub ${sub._id}:`, err);
        }
    }

    console.log(`[Subscription Cron] Done. Processed ${processed}/${expiredSubs.length} expired subscriptions.`);
    return { processed };
};

// ─────────────────────────────────────────────
// 6. POST /subscriptions/cancel
//    User tự huỷ gia hạn (không xóa gói, chỉ tắt auto_renew)
// ─────────────────────────────────────────────
exports.cancelAutoRenew = catchAsync(async (req, res) => {
    const sub = await getOrCreateSubscription(req.user._id);

    if (sub.plan_type === 'FREE') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Gói Free không có gia hạn tự động để huỷ');
    }

    sub.auto_renew = false;
    await sub.save();

    res.json({
        success: true,
        message: `Đã tắt gia hạn tự động. Gói ${sub.plan_type} vẫn có hiệu lực đến ${sub.expires_at?.toLocaleDateString('vi-VN')}.`,
        data: { expires_at: sub.expires_at },
    });
});

// 7. Background helper: Check and notify users with packages close to expiration (next 3 days)
exports.checkNearExpirySubscriptions = async () => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    // Find active Premium/VIP subscriptions that expire within 3 days
    const expiringSubs = await Subscription.find({
        plan_type: { $in: ['PREMIUM', 'VIP'] },
        status: 'ACTIVE',
        expires_at: { $gt: now, $lte: threeDaysFromNow }
    }).populate('user_id');

    for (const sub of expiringSubs) {
        if (!sub.user_id) continue;
        
        // Calculate days remaining
        const daysRemaining = Math.max(0, Math.ceil((sub.expires_at - now) / (1000 * 60 * 60 * 24)));
        
        // Check if we already sent an expiring notification within the last 3 days
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const alreadyNotified = await Notification.findOne({
            user_id: sub.user_id._id,
            type: 'SUBSCRIPTION_EXPIRING',
            created_at: { $gte: threeDaysAgo }
        });

        if (!alreadyNotified) {
            const planName = sub.plan_type === 'VIP' ? 'VIP' : 'Premium';
            await notifyUser(
                sub.user_id,
                `⏰ Gói ${planName} của bạn sắp hết hạn`,
                `Gói dịch vụ ${planName} của bạn sẽ hết hạn sau ${daysRemaining} ngày nữa (vào ngày ${sub.expires_at.toLocaleDateString('vi-VN')}). Hãy gia hạn ngay để không bị gián đoạn trải nghiệm chăm sóc thú cưng!`,
                'SUBSCRIPTION_EXPIRING'
            );
            console.log(`[Subscription Expiry Reminder] Sent warning to user ${sub.user_id._id} (expires in ${daysRemaining} days).`);
        }
    }
};

