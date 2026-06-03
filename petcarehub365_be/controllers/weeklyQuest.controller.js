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

    console.log(`[Quest Complete] Weekly/Monthly/Annual Quest ${quest._id} marked COMPLETED. Title: "${quest.title}"`);
    console.log(`[Quest Complete] Reward XP: ${quest.reward_xp}, Reward Coin: ${quest.reward_coin}`);

    // Cộng XP cho thú cưng
    const originalLevel = pet.stats.level;
    const addedXp = Number(quest.reward_xp || 0);
    console.log(`[Pet Stats Before] Pet name: "${pet.name}", level: ${pet.stats.level}, xp: ${pet.stats.xp}, mood: ${pet.stats.mood}`);
    
    pet.stats.xp = Number(pet.stats.xp || 0) + addedXp;
    
    // Tăng cấp
    let xpNeeded = pet.stats.level * 100 + 800;
    let leveledUp = false;
    
    while (pet.stats.xp >= xpNeeded) {
        pet.stats.level += 1;
        pet.stats.xp -= xpNeeded;
        leveledUp = true;
        xpNeeded = pet.stats.level * 100 + 800;
    }
    
    pet.stats.mood = Math.min(100, Number(pet.stats.mood || 0) + 15); // Tăng nhiều mood hơn
    pet.markModified('stats');
    console.log(`[Pet Stats After Quest XP] level: ${pet.stats.level}, xp: ${pet.stats.xp}, mood: ${pet.stats.mood}`);

    // Cộng Coins cho User
    const coinsReward = quest.reward_coin !== undefined ? Number(quest.reward_coin) : 30;
    const user = await User.findById(req.user._id);
    if (user) {
        user.coins = Number(user.coins || 0) + coinsReward;
        console.log(`[User Coins] User ${user.email} found. Coins before: ${user.coins - coinsReward}, added: ${coinsReward}, coins after: ${user.coins}`);
        
        // Cập nhật tiến trình thành tựu
        const { updateAchievementProgress } = require('../utils/achievementHelper');
        let unlockedAchievements = [];
        try {
            unlockedAchievements = await updateAchievementProgress(user, pet, quest);
            console.log(`[Achievements] Unlocked achievements:`, unlockedAchievements);
            console.log(`[Pet Stats After Achievements] level: ${pet.stats.level}, xp: ${pet.stats.xp}, mood: ${pet.stats.mood}`);
        } catch (achErr) {
            console.error('[Achievements Error] Error in achievement helper:', achErr);
        }
        
        try {
            await user.save();
            console.log(`[Database Save] User document saved successfully.`);
        } catch (userSaveErr) {
            console.error('[Database Save Error] Failed to save User:', userSaveErr);
            throw userSaveErr;
        }

        try {
            await pet.save();
            console.log(`[Database Save] Pet document saved successfully. Final stats in DB:`, pet.stats);
        } catch (petSaveErr) {
            console.error('[Database Save Error] Failed to save Pet:', petSaveErr);
            throw petSaveErr;
        }

        res.json({
            success: true,
            message: 'Hoàn thành nhiệm vụ dài hạn thành công! 🎉',
            data: {
                quest,
                unlockedAchievements,
                rewards: {
                    xp: addedXp,
                    coins: coinsReward,
                    leveledUp: pet.stats.level > originalLevel,
                    currentLevel: pet.stats.level,
                    currentXp: pet.stats.xp,
                    nextLevelXp: pet.stats.level * 100 + 800
                }
            }
        });
    } else {
        console.error(`[Error] User with ID ${req.user._id} not found when completing quest.`);
        throw new ApiError(httpStatus.NOT_FOUND, 'User không tồn tại');
    }
});
