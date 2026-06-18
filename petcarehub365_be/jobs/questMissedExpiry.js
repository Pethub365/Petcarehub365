const cron = require('node-cron');
const { DailyQuest } = require('../models');
const { checkVaccineReminders } = require('../controllers/health.controller');
const { checkNearExpirySubscriptions } = require('../controllers/subscription.controller');

/**
 * Thiết lập chạy lúc 00:05 sáng mỗi ngày.
 * Quét các DailyQuest có assigned_date nhỏ hơn ngày hôm nay (00:00:00) và đang ở trạng thái PENDING
 * để chuyển trạng thái thành MISSED.
 * Đồng thời chạy quét lịch tiêm vaccine sắp tới và cảnh báo hết hạn gói đăng ký.
 */
const startQuestExpiryJob = () => {
    // Run once on startup (5s after startup to ensure DB is connected)
    setTimeout(async () => {
        console.log('[Startup Job] Running initial startup health and subscription expiry checks...');
        try {
            await checkVaccineReminders();
        } catch (err) {
            console.error('[Startup Job] Error running vaccine checks on startup:', err);
        }
        try {
            await checkNearExpirySubscriptions();
        } catch (err) {
            console.error('[Startup Job] Error running subscription checks on startup:', err);
        }
    }, 5000);

    cron.schedule('5 0 * * *', async () => {
        console.log('[Cron Job] Running daily checks (marking missed daily quests, checking vaccines & sub expiries)...');
        
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0); // Lấy mốc 00:00:00 ngày hôm nay

        // 1. Quét chuyển trạng thái MISSED cho nhiệm vụ trễ hạn
        try {
            const result = await DailyQuest.updateMany(
                {
                    status: 'PENDING',
                    assigned_date: { $lt: todayStart }
                },
                {
                    $set: { status: 'MISSED' }
                }
            );
            console.log(`[Quest Job] Processed successfully. Marked ${result.modifiedCount} quests as MISSED.`);
        } catch (err) {
            console.error('[Quest Job] Error marking missed quests:', err);
        }

        // 2. Quét cảnh báo lịch tiêm vaccine
        try {
            await checkVaccineReminders();
        } catch (err) {
            console.error('[Vaccine Job] Error running vaccine checks:', err);
        }

        // 3. Quét cảnh báo gần hết hạn gói subscription
        try {
            await checkNearExpirySubscriptions();
        } catch (err) {
            console.error('[Subscription Job] Error running subscription checks:', err);
        }
    });
    console.log('[Quest Job] Daily Cron Job (Quests, Vaccines, Subscriptions) Registered.');
};

module.exports = { startQuestExpiryJob };
