const cron = require('node-cron');
const { DailyQuest } = require('../models');

/**
 * Thiết lập chạy lúc 00:05 sáng mỗi ngày.
 * Quét các DailyQuest có assigned_date nhỏ hơn ngày hôm nay (00:00:00) và đang ở trạng thái PENDING
 * để chuyển trạng thái thành MISSED.
 */
const startQuestExpiryJob = () => {
    cron.schedule('5 0 * * *', async () => {
        console.log('[Quest Job] Running job to mark missed daily quests...');
        
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0); // Lấy mốc 00:00:00 ngày hôm nay

        try {
            // Tìm các nhiệm vụ có ngày phân công nhỏ hơn ngày hôm nay và đang ở trạng thái PENDING
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
    });
    console.log('[Quest Job] Missed Quests Cron Job Registered.');
};

module.exports = { startQuestExpiryJob };
