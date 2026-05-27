/**
 * subscriptionExpiry.js
 * Background job kiểm tra subscription hết hạn và downgrade về Free.
 *
 * Chạy mỗi ngày lúc 00:05 sáng (dùng setInterval pure JS, không cần node-cron).
 * Được đăng ký trong server.js sau khi DB kết nối thành công.
 */

const { runExpiryCheck } = require('../controllers/subscription.controller');

// Tính milliseconds tới lần chạy tiếp theo (00:05 AM)
const msUntilNextRun = () => {
    const now = new Date();
    const next = new Date(now);
    next.setDate(next.getDate() + (now.getHours() >= 0 && now.getMinutes() >= 5 ? 1 : 0));
    next.setHours(0, 5, 0, 0);
    const diff = next - now;
    return diff > 0 ? diff : diff + 24 * 60 * 60 * 1000;
};

let _jobTimer = null;

/**
 * Khởi động scheduled job.
 * Lần đầu chạy sau khoảng thời gian còn lại đến 00:05 sáng.
 * Các lần tiếp theo chạy mỗi 24 giờ.
 */
const startSubscriptionExpiryJob = () => {
    const delay = msUntilNextRun();
    console.log(
        `[Subscription Job] Scheduled. Next run in ${Math.round(delay / 60000)} minutes (at 00:05 daily).`
    );

    _jobTimer = setTimeout(async function tick() {
        try {
            await runExpiryCheck();
        } catch (err) {
            console.error('[Subscription Job] Error during expiry check:', err);
        }
        // Lập lịch lần tiếp theo sau 24h
        _jobTimer = setTimeout(tick, 24 * 60 * 60 * 1000);
    }, delay);
};

/**
 * Dừng job (dùng khi test hoặc graceful shutdown).
 */
const stopSubscriptionExpiryJob = () => {
    if (_jobTimer) {
        clearTimeout(_jobTimer);
        _jobTimer = null;
        console.log('[Subscription Job] Stopped.');
    }
};

module.exports = { startSubscriptionExpiryJob, stopSubscriptionExpiryJob };
