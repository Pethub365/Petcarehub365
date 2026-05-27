const mongoose = require('mongoose');

/**
 * Subscription Model
 * Mỗi user có đúng 1 document subscription (upsert khi nâng cấp).
 * plan_type: FREE | PREMIUM | VIP
 * status:    ACTIVE | EXPIRED | CANCELLED
 */
const subscriptionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,   // 1 user – 1 subscription document
    },
    plan_type: {
        type: String,
        enum: ['FREE', 'PREMIUM', 'VIP'],
        default: 'FREE',
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'],
        default: 'ACTIVE',
    },
    started_at: {
        type: Date,
        default: Date.now,
    },
    // null => FREE (không hết hạn)
    expires_at: {
        type: Date,
        default: null,
    },
    // Gói trước đó khi downgrade
    previous_plan: {
        type: String,
        enum: ['FREE', 'PREMIUM', 'VIP', null],
        default: null,
    },
    // Ngày hết hạn của gói trước đó (để restore nếu cần)
    previous_expires_at: {
        type: Date,
        default: null,
    },
    // Có gia hạn tự động không (phase 2)
    auto_renew: {
        type: Boolean,
        default: false,
    },
    // Ngày bị downgrade (khi expired)
    downgraded_at: {
        type: Date,
        default: null,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

subscriptionSchema.index({ user_id: 1 });
subscriptionSchema.index({ status: 1, expires_at: 1 }); // Cho cron job query nhanh

module.exports = mongoose.model('Subscription', subscriptionSchema);
