const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { WeeklyQuest, Pet, User, FamilyGroup } = require('../models');
const ApiError = require('../utils/ApiError');
const { ensureWeeklyQuestsForPet } = require('../utils/questHelper');

// Lấy danh sách nhiệm vụ Tuần/Tháng/Năm
exports.getWeeklyQuests = catchAsync(async (req, res) => {
    const { pet_id, period, date } = req.query;

    if (!pet_id) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Thiếu thông tin pet_id');
    }
    const activePeriod = period || 'WEEKLY';

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

    const quests = await ensureWeeklyQuestsForPet(pet, activePeriod, date);

    res.json({
        success: true,
        data: { quests }
    });
});

// Lấy chi tiết một nhiệm vụ
exports.getWeeklyQuestById = catchAsync(async (req, res) => {
    const quest = await WeeklyQuest.findById(req.params.id);
    if (!quest) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Nhiệm vụ không tồn tại');
    }
    
    // Kiểm tra quyền
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

// Hoàn thành nhiệm vụ Tuần/Tháng/Năm
exports.completeWeeklyQuest = catchAsync(async (req, res) => {
    const { id } = req.params;

    const quest = await WeeklyQuest.findById(id);
    if (!quest) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Nhiệm vụ không tồn tại');
    }

    // Kiểm tra quyền
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

    // Cập nhật trạng thái
    quest.status = 'COMPLETED';
    quest.completed_by_user_id = req.user._id;
    quest.completed_at = new Date();
    await quest.save();

    // Cộng XP cho thú cưng
    const originalLevel = pet.stats.level;
    pet.stats.xp += quest.reward_xp;
    
    // Tăng cấp
    let xpNeeded = pet.stats.level * 100 + 800;
    let leveledUp = false;
    
    while (pet.stats.xp >= xpNeeded) {
        pet.stats.level += 1;
        pet.stats.xp -= xpNeeded;
        leveledUp = true;
        xpNeeded = pet.stats.level * 100 + 800;
    }
    
    pet.stats.mood = Math.min(100, pet.stats.mood + 15); // Tăng nhiều mood hơn
    pet.markModified('stats');

    // Cộng Coins cho User
    const coinsReward = quest.reward_coin !== undefined ? quest.reward_coin : 30;
    const user = await User.findById(req.user._id);
    if (user) {
        user.coins = (user.coins || 0) + coinsReward;
        
        // Cập nhật tiến trình thành tựu
        const { updateAchievementProgress } = require('../utils/achievementHelper');
        const unlockedAchievements = await updateAchievementProgress(user, pet, quest);
        
        await user.save();
        await pet.save();

        res.json({
            success: true,
            message: 'Hoàn thành nhiệm vụ dài hạn thành công! 🎉',
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
