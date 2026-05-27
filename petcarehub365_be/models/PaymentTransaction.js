const mongoose = require('mongoose');

/**
 * PaymentTransaction Model
 * Lưu lịch sử mỗi lần thanh toán gói.
 */
const paymentTransactionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subscription_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true,
    },
    plan_type: {
        type: String,
        enum: ['PREMIUM', 'VIP'],
        required: true,
    },
    package_duration: {
        type: String,
        enum: ['MONTHLY', 'YEARLY'],
        required: true,
    },
    amount: {
        type: Number,
        required: true, // VND, ví dụ: 49000
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
        default: 'PENDING',
    },
    payment_method: {
        type: String,
        enum: ['CARD', 'MOMO', 'ZALOPAY', 'VIETQR', 'MANUAL'],
        default: 'MANUAL',
    },
    // Mã giao dịch nội bộ (UUID hoặc do cổng thanh toán trả về)
    transaction_ref: {
        type: String,
        default: null,
    },
    // Thời điểm thanh toán thành công
    paid_at: {
        type: Date,
        default: null,
    },
    // Ngày bắt đầu gói sau khi thanh toán
    subscription_start: {
        type: Date,
        default: null,
    },
    // Ngày hết hạn gói sau khi thanh toán
    subscription_end: {
        type: Date,
        default: null,
    },
    description: {
        type: String,
        default: '',
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

paymentTransactionSchema.index({ user_id: 1, created_at: -1 });
paymentTransactionSchema.index({ transaction_ref: 1 });

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
