const { Achievement, UserAchievement, Pet, User } = require('../models');

// Seed default achievements if they don't exist
const seedDefaultAchievements = async () => {
    const count = await Achievement.countDocuments();
    if (count > 0) return;

    const list = [
        {
            key: 'FIRST_QUEST',
            title: 'Khởi đầu tốt đẹp 🐾',
            description: 'Hoàn thành 1 nhiệm vụ bất kỳ cho thú cưng để nhận huy hiệu Dải băng đỏ 🎗️.',
            trigger_quest_category: 'ANY',
            required_count: 1,
            badge_icon: 'ribbon',
            badge_color: '#EC4B4B',
            badge_bg_color: '#FFF0F0',
            reward_xp: 50,
            reward_coin: 20,
            sort_order: 1
        },
        {
            key: 'FEED_MORNING_5',
            title: 'Bữa sáng đầy đủ ☀️',
            description: 'Cho thú cưng ăn bữa sáng dinh dưỡng 5 lần để nhận huy hiệu Bát ăn vàng 🍳.',
            trigger_quest_category: 'NUTRITION',
            trigger_quest_title_contains: 'Bữa sáng',
            required_count: 5,
            badge_icon: 'restaurant',
            badge_color: '#FFB000',
            badge_bg_color: '#FFF9E6',
            reward_xp: 100,
            reward_coin: 30,
            sort_order: 2
        },
        {
            key: 'FEED_DINNER_5',
            title: 'Bữa tối ấm cúng 🌙',
            description: 'Cho thú cưng ăn tối đúng giờ 5 lần để nhận huy hiệu Trăng khuyết tím 🌙.',
            trigger_quest_category: 'NUTRITION',
            trigger_quest_title_contains: 'tối',
            required_count: 5,
            badge_icon: 'moon',
            badge_color: '#8E44AD',
            badge_bg_color: '#F4ECF7',
            reward_xp: 100,
            reward_coin: 30,
            sort_order: 3
        },
        {
            key: 'WALK_DOG_5',
            title: 'Người bạn đồng hành 🦮',
            description: 'Hoàn thành 5 nhiệm vụ dắt chó đi dạo để nhận huy hiệu Bước chân xanh 🦮.',
            trigger_quest_category: 'DAILY_ROUTINE',
            trigger_quest_title_contains: 'dạo',
            required_count: 5,
            badge_icon: 'walk',
            badge_color: '#2F80ED',
            badge_bg_color: '#E2F0FF',
            reward_xp: 100,
            reward_coin: 30,
            sort_order: 4
        },
        {
            key: 'CLEAN_LITTER_5',
            title: 'Vệ sinh sạch sẽ 🧹',
            description: 'Hoàn thành 5 nhiệm vụ dọn khay cát hoặc vệ sinh tai để nhận huy hiệu Chổi quét ngọc 🧹.',
            trigger_quest_category: 'DAILY_ROUTINE',
            trigger_quest_title_contains: 'vệ sinh',
            required_count: 5,
            badge_icon: 'trash',
            badge_color: '#16A085',
            badge_bg_color: '#E8F8F5',
            reward_xp: 100,
            reward_coin: 30,
            sort_order: 5
        },
        {
            key: 'TRAINING_MASTER_3',
            title: 'Trò cưng thông minh 🎓',
            description: 'Hoàn thành 3 nhiệm vụ Huấn luyện/Học tập để nhận huy hiệu Mũ cử nhân xanh 🎓.',
            trigger_quest_category: 'TRAINING',
            required_count: 3,
            badge_icon: 'school',
            badge_color: '#2980B9',
            badge_bg_color: '#EBF5FB',
            reward_xp: 120,
            reward_coin: 40,
            sort_order: 6
        },
        {
            key: 'HEALTH_CHECK_3',
            title: 'Bảo vệ sức khỏe 🩺',
            description: 'Hoàn thành 3 nhiệm vụ Chăm sóc sức khỏe để nhận huy hiệu Trái tim xanh lá 🩺.',
            trigger_quest_category: 'HEALTH_CARE',
            required_count: 3,
            badge_icon: 'heart',
            badge_color: '#27AE60',
            badge_bg_color: '#E8F8F0',
            reward_xp: 150,
            reward_coin: 40,
            sort_order: 7
        },
        {
            key: 'VACCINE_CHAMPION',
            title: 'Vắc-xin phòng bệnh 🛡️',
            description: 'Hoàn thành 1 nhiệm vụ tiêm vaccine định kỳ hàng năm để nhận huy hiệu Khiên cam bảo vệ 🛡️.',
            trigger_quest_category: 'HEALTH_CARE',
            trigger_quest_title_contains: 'tiêm',
            required_count: 1,
            badge_icon: 'shield-checkmark',
            badge_color: '#D35400',
            badge_bg_color: '#FDF2E9',
            reward_xp: 200,
            reward_coin: 50,
            sort_order: 8
        },
        {
            key: 'ALL_QUESTS_10',
            title: 'Chăm sóc bền bỉ 🌟',
            description: 'Hoàn thành 10 nhiệm vụ bất kỳ cho thú cưng để nhận huy hiệu Ngôi sao xanh 🌟.',
            trigger_quest_category: 'ANY',
            required_count: 10,
            badge_icon: 'star',
            badge_color: '#3498DB',
            badge_bg_color: '#EBF5FB',
            reward_xp: 150,
            reward_coin: 50,
            sort_order: 9
        },
        {
            key: 'ALL_QUESTS_30',
            title: 'Trách nhiệm tối cao 🏆',
            description: 'Hoàn thành 30 nhiệm vụ bất kỳ cho thú cưng để nhận huy hiệu Cúp vương miện vàng 🏆.',
            trigger_quest_category: 'ANY',
            required_count: 30,
            badge_icon: 'trophy',
            badge_color: '#D4AC0D',
            badge_bg_color: '#FEF9E7',
            reward_xp: 350,
            reward_coin: 100,
            sort_order: 10
        },
        {
            key: 'NUTRITION_15',
            title: 'Chuyên gia dinh dưỡng 🍏',
            description: 'Hoàn thành 15 nhiệm vụ Dinh dưỡng để nhận huy hiệu Táo xanh sức khỏe 🍏.',
            trigger_quest_category: 'NUTRITION',
            required_count: 15,
            badge_icon: 'nutrition',
            badge_color: '#2ECC71',
            badge_bg_color: '#E8F8F0',
            reward_xp: 200,
            reward_coin: 60,
            sort_order: 11
        },
        {
            key: 'ROUTINE_15',
            title: 'Thói quen nề nếp 📅',
            description: 'Hoàn thành 15 nhiệm vụ Chăm sóc thường ngày để nhận huy hiệu Lịch trình xanh 📅.',
            trigger_quest_category: 'DAILY_ROUTINE',
            required_count: 15,
            badge_icon: 'calendar',
            badge_color: '#9B59B6',
            badge_bg_color: '#F4ECF7',
            reward_xp: 200,
            reward_coin: 60,
            sort_order: 12
        },
        {
            key: 'LONG_TERM_QUEST',
            title: 'Thử thách bền bỉ ⏳',
            description: 'Hoàn thành 3 nhiệm vụ Tuần/Tháng/Năm để nhận huy hiệu Đồng hồ cát cổ ⏳.',
            trigger_quest_category: 'ANY',
            required_count: 3,
            badge_icon: 'hourglass',
            badge_color: '#E67E22',
            badge_bg_color: '#FDF2E9',
            reward_xp: 250,
            reward_coin: 80,
            sort_order: 13
        },
        {
            key: 'TRAINING_10',
            title: 'Huấn luyện tài ba 🐕',
            description: 'Hoàn thành 10 nhiệm vụ Huấn luyện để nhận huy hiệu Còi vàng 🐕.',
            trigger_quest_category: 'TRAINING',
            required_count: 10,
            badge_icon: 'volume-high',
            badge_color: '#E74C3C',
            badge_bg_color: '#FDEDEC',
            reward_xp: 250,
            reward_coin: 70,
            sort_order: 14
        },
        {
            key: 'HEALTH_10',
            title: 'Thần hộ mệnh y tế 🩺',
            description: 'Hoàn thành 10 nhiệm vụ Sức khỏe để nhận huy hiệu Chữ thập đỏ 🩺.',
            trigger_quest_category: 'HEALTH_CARE',
            required_count: 10,
            badge_icon: 'medical',
            badge_color: '#C0392B',
            badge_bg_color: '#FDEDEC',
            reward_xp: 300,
            reward_coin: 80,
            sort_order: 15
        }
    ];

    for (const ach of list) {
        await Achievement.findOneAndUpdate(
            { key: ach.key },
            ach,
            { upsert: true, new: true }
        );
    }
    console.log('Synchronized default Achievements database catalog 🏆');
};

// Evaluate progress when a quest is completed
const updateAchievementProgress = async (user, pet, quest) => {
    try {
        await seedDefaultAchievements();

        // 1. Fetch all achievements from DB
        const achievements = await Achievement.find({});

        if (!pet || !user) return [];
        const unlockedAchievements = [];

        for (const achievement of achievements) {
            // Check if quest matches trigger condition
            let isMatch = false;

            if (achievement.trigger_quest_category === 'ANY') {
                isMatch = true;
            } else if (achievement.trigger_quest_category === quest.category) {
                isMatch = true;
            }

            // Check if title substring condition matches
            if (isMatch && achievement.trigger_quest_title_contains) {
                const questTitle = quest.title || '';
                isMatch = questTitle.toLowerCase().includes(achievement.trigger_quest_title_contains.toLowerCase());
            }

            // Custom condition: LONG_TERM_QUEST triggers only for weekly/monthly/annual quests
            if (isMatch && achievement.key === 'LONG_TERM_QUEST') {
                const isWeeklyOrLonger = quest.period && quest.period !== 'DAILY';
                if (!isWeeklyOrLonger) {
                    isMatch = false;
                }
            }

            if (isMatch) {
                // Find or create UserAchievement progress
                let userAch = await UserAchievement.findOne({
                    user_id: user._id,
                    achievement_key: achievement.key,
                    pet_id: pet._id
                });

                if (!userAch) {
                    userAch = new UserAchievement({
                        user_id: user._id,
                        achievement_key: achievement.key,
                        pet_id: pet._id,
                        current_count: 0,
                        is_unlocked: false
                    });
                }

                // If already unlocked, do nothing
                if (userAch.is_unlocked) continue;

                // Increment progress
                userAch.current_count += 1;

                // Check if unlocked
                if (userAch.current_count >= achievement.required_count) {
                    userAch.is_unlocked = true;
                    userAch.unlocked_at = new Date();

                    // Award rewards to pet (in-memory)
                    pet.stats.xp += achievement.reward_xp;
                    
                    // Level up check
                    let xpNeeded = pet.stats.level * 100 + 800;
                    while (pet.stats.xp >= xpNeeded) {
                        pet.stats.level += 1;
                        pet.stats.xp -= xpNeeded;
                        xpNeeded = pet.stats.level * 100 + 800;
                    }
                    pet.markModified('stats');

                    // Award coins to user (in-memory)
                    user.coins = (user.coins || 0) + achievement.reward_coin;
                    unlockedAchievements.push(achievement.title);
                }

                await userAch.save();
            }
        }

        return unlockedAchievements;
    } catch (err) {
        console.error('Error updating achievement progress:', err);
        return [];
    }
};

module.exports = {
    seedDefaultAchievements,
    updateAchievementProgress
};
