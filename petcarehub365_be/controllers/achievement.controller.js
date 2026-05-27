const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { Achievement, UserAchievement, Pet } = require('../models');
const ApiError = require('../utils/ApiError');
const { seedDefaultAchievements } = require('../utils/achievementHelper');

exports.getAchievements = catchAsync(async (req, res) => {
    const { pet_id } = req.query;

    if (!pet_id) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Thiếu thông tin pet_id');
    }

    // Seed default if empty
    await seedDefaultAchievements();

    // Verify pet owner or family group
    const pet = await Pet.findById(pet_id);
    if (!pet) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Thú cưng không tồn tại');
    }

    // Fetch achievements catalog sorted by sort_order
    const achievements = await Achievement.find({}).sort({ sort_order: 1 });

    // Fetch user progress for these achievements
    const progressList = await UserAchievement.find({
        user_id: req.user._id,
        pet_id: pet_id
    });

    const progressMap = {};
    progressList.forEach(p => {
        progressMap[p.achievement_key] = p;
    });

    // Enriched achievements with user progress
    const enrichedAchievements = achievements.map(ach => {
        const prog = progressMap[ach.key] || {
            current_count: 0,
            is_unlocked: false,
            unlocked_at: null
        };
        return {
            key: ach.key,
            title: ach.title,
            description: ach.description,
            trigger_quest_category: ach.trigger_quest_category,
            required_count: ach.required_count,
            badge_icon: ach.badge_icon,
            badge_color: ach.badge_color,
            badge_bg_color: ach.badge_bg_color,
            reward_xp: ach.reward_xp,
            reward_coin: ach.reward_coin,
            current_count: prog.current_count,
            is_unlocked: prog.is_unlocked,
            unlocked_at: prog.unlocked_at
        };
    });

    res.json({
        success: true,
        data: { achievements: enrichedAchievements }
    });
});
