const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { DailyQuest, Pet, VetKnowledge, User, FamilyGroup } = require('../models');
const ApiError = require('../utils/ApiError');

// Hàm seed VetKnowledge nếu database chưa có dữ liệu
const seedDefaultKnowledge = async () => {
    const count = await VetKnowledge.countDocuments();
    if (count === 0) {
        await VetKnowledge.create([
            {
                title: 'Vệ sinh tai cho Cún cưng phòng viêm nhiễm',
                category: 'DAILY_ROUTINE',
                target_audience: {
                    species: 'DOG',
                    breed: 'ALL',
                    age_range: { min_months: 0, max_months: 999 },
                    health_condition: 'ALL'
                },
                trigger_weather: 'ALL',
                medical_fact: 'Độ ẩm kẽ tai cún dễ tăng cao gây nấm và ký sinh trùng tai phát triển mạnh.',
                recommended_action: 'Dùng bông gòn thấm dung dịch rửa tai lau nhẹ nhàng vành tai ngoài của cún.',
                base_reward_xp: 30,
                is_active: true
            },
            {
                title: 'Chăm sóc lông và da mèo mùa ẩm',
                category: 'DAILY_ROUTINE',
                target_audience: {
                    species: 'CAT',
                    breed: 'ALL',
                    age_range: { min_months: 0, max_months: 999 },
                    health_condition: 'ALL'
                },
                trigger_weather: 'ALL',
                medical_fact: 'Mèo dễ bị nấm da khi độ ẩm môi trường cao.',
                recommended_action: 'Chải lông cho mèo bằng lược thưa và sấy nhẹ da lông mèo.',
                base_reward_xp: 30,
                is_active: true
            },
            {
                title: 'Bài tập huấn luyện phản xạ tập trung',
                category: 'TRAINING',
                target_audience: {
                    species: 'DOG',
                    breed: 'ALL',
                    age_range: { min_months: 0, max_months: 999 },
                    health_condition: 'ALL'
                },
                trigger_weather: 'ALL',
                medical_fact: 'Bài tập ngồi/nằm theo lệnh giúp tăng khả năng tập trung và giảm stress ở chó.',
                recommended_action: 'Huấn luyện cún ngồi yên trong 5 giây, thưởng hạt mỗi khi hoàn thành xuất sắc.',
                base_reward_xp: 40,
                is_active: true
            },
            {
                title: 'Huấn luyện mèo đi vệ sinh đúng chỗ',
                category: 'TRAINING',
                target_audience: {
                    species: 'CAT',
                    breed: 'ALL',
                    age_range: { min_months: 0, max_months: 999 },
                    health_condition: 'ALL'
                },
                trigger_weather: 'ALL',
                medical_fact: 'Mèo cần một vị trí khay cát cố định và yên tĩnh để tạo thói quen vệ sinh đúng nơi.',
                recommended_action: 'Đặt mèo vào khay cát sau khi thức dậy hoặc sau bữa ăn 15 phút.',
                base_reward_xp: 40,
                is_active: true
            }
        ]);
        console.log('Seeded default VetKnowledge articles 🐾');
    }
};

// Lấy danh sách nhiệm vụ hàng ngày
exports.getDailyQuests = catchAsync(async (req, res) => {
    const { pet_id, date } = req.query;

    if (!pet_id) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Thiếu thông tin pet_id');
    }

    // Xác thực quyền sở hữu thú cưng hoặc thuộc nhóm gia đình
    const pet = await Pet.findById(pet_id);
    if (!pet) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Thú cưng không tồn tại');
    }
    const isOwner = pet.owner_id.toString() === req.user._id.toString();
    const familyGroup = await FamilyGroup.findOne({
        pet_ids: pet._id,
        'members.user_id': req.user._id
    });
    if (!isOwner && !familyGroup) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền truy cập thông tin thú cưng này');
    }

    const { ensureDailyQuestsForPet } = require('../utils/questHelper');
    let quests = await ensureDailyQuestsForPet(pet, date);

    // Kiểm tra khóa bữa ăn tiếp theo sau 5 tiếng
    const completedNutritions = quests.filter(q => q.category === 'NUTRITION' && q.status === 'COMPLETED');
    if (completedNutritions.length > 0) {
        const latestCompleted = completedNutritions.reduce((latest, current) => {
            const latestTime = new Date(latest.completed_at).getTime();
            const currentTime = new Date(current.completed_at).getTime();
            return currentTime > latestTime ? current : latest;
        });

        if (latestCompleted && latestCompleted.completed_at) {
            const fiveHoursMs = 5 * 60 * 60 * 1000;
            const completedTime = new Date(latestCompleted.completed_at).getTime();
            const timePassed = Date.now() - completedTime;
            if (timePassed < fiveHoursMs) {
                const remainingMs = fiveHoursMs - timePassed;
                const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
                const unlocksAt = completedTime + fiveHoursMs;
                quests = quests.map(q => {
                    const qObj = q.toObject ? q.toObject() : q;
                    if (qObj.category === 'NUTRITION' && qObj.status === 'PENDING') {
                        qObj.isLocked = true;
                        qObj.lockMessage = `Mở khóa sau ${remainingHours} giờ`;
                        qObj.unlocksAt = new Date(unlocksAt).toISOString();
                    }
                    return qObj;
                });
            }
        }
    }

    res.json({
        success: true,
        data: { quests }
    });
});

// Xác nhận hoàn thành nhiệm vụ
exports.completeQuest = catchAsync(async (req, res) => {
    const { id } = req.params;

    const quest = await DailyQuest.findById(id);
    if (!quest) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Nhiệm vụ không tồn tại');
    }

    // Xác thực pet thuộc sở hữu của người dùng hoặc thuộc nhóm gia đình
    const pet = await Pet.findById(quest.pet_id);
    if (!pet) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Thú cưng không tồn tại');
    }
    const isOwner = pet.owner_id.toString() === req.user._id.toString();
    const familyGroup = await FamilyGroup.findOne({
        pet_ids: pet._id,
        'members.user_id': req.user._id
    });
    if (!isOwner && !familyGroup) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền thao tác trên nhiệm vụ này');
    }

    if (quest.status === 'COMPLETED') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Nhiệm vụ đã được hoàn thành trước đó');
    }

    // Kiểm tra khóa bữa ăn tiếp theo sau 5 tiếng
    if (quest.category === 'NUTRITION') {
        const completedNutritions = await DailyQuest.find({
            pet_id: quest.pet_id,
            category: 'NUTRITION',
            status: 'COMPLETED',
            assigned_date: quest.assigned_date,
            _id: { $ne: quest._id }
        });
        if (completedNutritions.length > 0) {
            const latestCompleted = completedNutritions.reduce((latest, current) => {
                const latestTime = new Date(latest.completed_at).getTime();
                const currentTime = new Date(current.completed_at).getTime();
                return currentTime > latestTime ? current : latest;
            });
            const fiveHoursMs = 5 * 60 * 60 * 1000;
            const timePassed = Date.now() - new Date(latestCompleted.completed_at).getTime();
            if (timePassed < fiveHoursMs) {
                const remainingHours = Math.ceil((fiveHoursMs - timePassed) / (1000 * 60 * 60));
                throw new ApiError(httpStatus.BAD_REQUEST, `Chưa đến giờ ăn tiếp theo. Vui lòng đợi thêm ${remainingHours} giờ.`);
            }
        }
    }

    // Cập nhật trạng thái quest
    quest.status = 'COMPLETED';
    quest.completed_by_user_id = req.user._id;
    quest.completed_at = new Date();
    await quest.save();

    // Cộng XP cho thú cưng
    const originalLevel = pet.stats.level;
    pet.stats.xp += quest.reward_xp;
    
    // Công thức tăng cấp: level * 100 + 800 XP để lên cấp tiếp theo.
    let xpNeeded = pet.stats.level * 100 + 800;
    let leveledUp = false;
    
    while (pet.stats.xp >= xpNeeded) {
        pet.stats.level += 1;
        pet.stats.xp -= xpNeeded;
        leveledUp = true;
        xpNeeded = pet.stats.level * 100 + 800;
    }
    
    // Tăng nhẹ mood và energy khi hoàn thành nhiệm vụ
    pet.stats.mood = Math.min(100, pet.stats.mood + 5);
    pet.markModified('stats');

    // Cộng tiền xu (Coins) cho chủ sở hữu
    const coinsReward = quest.reward_coin !== undefined ? quest.reward_coin : 10;
    const user = await User.findById(req.user._id);
    if (user) {
        user.coins = (user.coins || 0) + coinsReward;
        
        // Cập nhật tiến trình thành tựu (in-memory)
        const { updateAchievementProgress } = require('../utils/achievementHelper');
        const unlockedAchievements = await updateAchievementProgress(user, pet, quest);
        
        await user.save();
        await pet.save();

        res.json({
            success: true,
            message: 'Hoàn thành nhiệm vụ thành công! 🎉',
            data: {
                quest,
                unlockedAchievements,
                rewards: {
                    xp: quest.reward_xp,
                    coins: coinsReward,
                    leveledUp: pet.stats.level > originalLevel,
                    currentLevel: pet.stats.level,
                    currentXp: pet.stats.xp,
                    nextLevelXp: pet.stats.level * 100 + 800
                }
            }
        });
    }
});

// Lấy chi tiết một nhiệm vụ
exports.getDailyQuestById = catchAsync(async (req, res) => {
    const quest = await DailyQuest.findById(req.params.id).populate('source_knowledge_id');
    if (!quest) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Nhiệm vụ không tồn tại');
    }
    
    // Kiểm tra quyền sở hữu thú cưng hoặc thuộc nhóm gia đình
    const pet = await Pet.findById(quest.pet_id);
    if (!pet) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Thú cưng không tồn tại');
    }
    const isOwner = pet.owner_id.toString() === req.user._id.toString();
    const familyGroup = await FamilyGroup.findOne({
        pet_ids: pet._id,
        'members.user_id': req.user._id
    });
    if (!isOwner && !familyGroup) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền xem thông tin nhiệm vụ này');
    }

    res.json({
        success: true,
        data: { quest }
    });
});

