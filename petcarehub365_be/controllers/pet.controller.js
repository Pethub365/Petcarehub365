const httpStatus = require('http-status');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const { Pet } = require('../models');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

// Helper to parse dob robustly
const parseDob = (dob) => {
    if (!dob) return new Date();
    const d = new Date(dob);
    if (!isNaN(d.getTime())) {
        return d;
    }
    // Try to parse formats like DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY
    const parts = String(dob).trim().split(/[./-]/);
    if (parts.length === 3) {
        if (parts[2].length === 4) {
            // Day.Month.Year
            const parsed = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
            if (!isNaN(parsed.getTime())) return parsed;
        } else if (parts[0].length === 4) {
            // Year-Month-Day
            const parsed = new Date(`${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`);
            if (!isNaN(parsed.getTime())) return parsed;
        }
    }
    return new Date(); // Fallback to current date
};


// 1. Tạo thú cưng mới
exports.createPet = catchAsync(async (req, res) => {
    // Giới hạn số lượng pet cho gói FREE (tối đa 1 pet)
    const userPlan = req.user.subscription_plan || 'FREE';
    if (userPlan === 'FREE') {
        const petCount = await Pet.countDocuments({ owner_id: req.user._id });
        if (petCount >= 1) {
            throw new ApiError(
                httpStatus.PAYMENT_REQUIRED,
                'Gói Miễn Phí chỉ hỗ trợ lưu trữ tối đa 1 hồ sơ thú cưng. Vui lòng nâng cấp lên gói Premium để lưu trữ không giới hạn.',
                { code: 'UPGRADE_REQUIRED', required_plan: 'PREMIUM', current_plan: 'FREE' }
            );
        }
    }

    const { name, species, breed, dob, weight, gender, is_neutered, health_status } = req.body;

    let avatar_url = null;
    // Xử lý upload ảnh thú cưng lên Cloudinary nếu có file gửi lên
    if (req.file) {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'petcarehub365/pets',
        });
        avatar_url = result.secure_url;
    }

    const pet = await Pet.create({
        owner_id: req.user._id,
        name,
        species: species ? species.toUpperCase() : 'OTHER',
        breed,
        dob: parseDob(dob),
        weight: weight ? Number(weight) : null,
        gender: gender ? gender.toUpperCase() : 'UNKNOWN',
        is_neutered: is_neutered === 'true' || is_neutered === true,
        health_status: health_status ? health_status.toUpperCase() : 'NORMAL',
        avatar_url,
        stats: {
            xp: 0,
            level: 1,
            mood: 100,
            energy: 100
        }
    });

    res.status(httpStatus.CREATED).json({
        success: true,
        message: 'Thú cưng đã được tạo thành công 🐾',
        data: { pet }
    });
});

// 2. Lấy danh sách thú cưng của người dùng (bao gồm pet sở hữu và pet trong nhóm gia đình)
exports.getPets = catchAsync(async (req, res) => {
    const { FamilyGroup } = require('../models');
    
    // Tìm các nhóm gia đình mà user tham gia
    const familyGroups = await FamilyGroup.find({ 'members.user_id': req.user._id });
    const familyPetIds = familyGroups.reduce((acc, group) => {
        if (group.pet_ids && group.pet_ids.length > 0) {
            group.pet_ids.forEach(id => acc.push(id));
        }
        return acc;
    }, []);

    // Lấy pet sở hữu hoặc thuộc nhóm gia đình
    const pets = await Pet.find({
        $or: [
            { owner_id: req.user._id },
            { _id: { $in: familyPetIds } }
        ]
    });

    const { ensureDailyQuestsForPet } = require('../utils/questHelper');
    const enrichedPets = [];
    for (const pet of pets) {
        try {
            const quests = await ensureDailyQuestsForPet(pet, new Date());
            const isTodayQuestsCompleted = quests.length > 0 && quests.every(q => q.status === 'COMPLETED');
            
            const petObj = pet.toObject();
            petObj.isTodayQuestsCompleted = isTodayQuestsCompleted;
            enrichedPets.push(petObj);
        } catch (err) {
            console.error('Error getting today quest status for pet', pet._id, err);
            const petObj = pet.toObject();
            petObj.isTodayQuestsCompleted = false;
            enrichedPets.push(petObj);
        }
    }

    res.json({
        success: true,
        data: { pets: enrichedPets }
    });
});

// 3. Lấy thông tin thú cưng chi tiết
exports.getPetById = catchAsync(async (req, res) => {
    const { FamilyGroup } = require('../models');
    
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy thú cưng');
    }

    // Kiểm tra quyền: chủ sở hữu hoặc thành viên gia đình chứa pet này
    const isOwner = pet.owner_id.toString() === req.user._id.toString();
    const familyGroup = await FamilyGroup.findOne({
        pet_ids: pet._id,
        'members.user_id': req.user._id
    });

    if (!isOwner && !familyGroup) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền truy cập thông tin thú cưng này');
    }

    const { ensureDailyQuestsForPet } = require('../utils/questHelper');
    let isTodayQuestsCompleted = false;
    try {
        const quests = await ensureDailyQuestsForPet(pet, new Date());
        isTodayQuestsCompleted = quests.length > 0 && quests.every(q => q.status === 'COMPLETED');
    } catch (err) {
        console.error('Error getting today quest status for pet', pet._id, err);
    }
    
    const petObj = pet.toObject();
    petObj.isTodayQuestsCompleted = isTodayQuestsCompleted;

    res.json({
        success: true,
        data: { pet: petObj }
    });
});

// 4. Cập nhật thông tin thú cưng
exports.updatePet = catchAsync(async (req, res) => {
    const { FamilyGroup } = require('../models');
    
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy thú cưng');
    }

    // Kiểm tra quyền: chủ sở hữu hoặc thành viên gia đình chứa pet này
    const isOwner = pet.owner_id.toString() === req.user._id.toString();
    const familyGroup = await FamilyGroup.findOne({
        pet_ids: pet._id,
        'members.user_id': req.user._id
    });

    if (!isOwner && !familyGroup) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền cập nhật thông tin thú cưng này');
    }

    const { name, species, breed, dob, weight, gender, is_neutered, health_status } = req.body;

    // Cập nhật ảnh đại diện lên Cloudinary nếu có file mới
    if (req.file) {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'petcarehub365/pets',
        });
        pet.avatar_url = result.secure_url;
    }

    if (name !== undefined) pet.name = name;
    if (species !== undefined) pet.species = species.toUpperCase();
    if (breed !== undefined) pet.breed = breed;
    if (dob !== undefined) pet.dob = parseDob(dob);
    if (weight !== undefined) pet.weight = Number(weight);
    if (gender !== undefined) pet.gender = gender.toUpperCase();
    if (is_neutered !== undefined) pet.is_neutered = is_neutered === 'true' || is_neutered === true;
    if (health_status !== undefined) pet.health_status = health_status.toUpperCase();

    await pet.save();

    res.json({
        success: true,
        message: 'Cập nhật thông tin thú cưng thành công 🐾',
        data: { pet }
    });
});

// 5. Xóa hồ sơ thú cưng (chỉ chủ sở hữu được xóa)
exports.deletePet = catchAsync(async (req, res) => {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy thú cưng');
    }

    if (pet.owner_id.toString() !== req.user._id.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Chỉ chủ sở hữu mới có quyền xóa hồ sơ thú cưng');
    }

    await Pet.findByIdAndDelete(req.params.id);

    res.json({
        success: true,
        message: 'Đã xóa hồ sơ thú cưng thành công'
    });
});

// 6. Lấy bảng xếp hạng thú cưng theo XP (hỗ trợ lọc theo Tuần/Tháng)
exports.getLeaderboard = catchAsync(async (req, res) => {
    const { species, currentPetId, timeFilter } = req.query;
    const filter = {};
    if (species && species !== 'ALL') {
        filter.species = species.toUpperCase();
    }

    const now = new Date();
    let startDate = null;
    if (timeFilter === 'WEEK') {
        const day = now.getDay();
        const diff = now.getDate() - (day === 0 ? 6 : day - 1);
        startDate = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
    } else if (timeFilter === 'MONTH') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    let leaderboard;
    if (startDate) {
        // Lấy bảng xếp hạng dựa trên XP kiếm được trong khoảng thời gian (Tuần/Tháng)
        leaderboard = await Pet.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: 'dailyquests',
                    let: { petId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$pet_id', '$$petId'] },
                                        { $eq: ['$status', 'COMPLETED'] },
                                        { $gte: ['$completed_at', startDate] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'completedQuests'
                }
            },
            {
                $addFields: {
                    'stats.xp': { $sum: '$completedQuests.reward_xp' },
                    'stats.challenges_won': { $size: '$completedQuests' }
                }
            },
            { $sort: { 'stats.xp': -1 } },
            { $limit: 20 }
        ]);

        leaderboard = await Pet.populate(leaderboard, {
            path: 'owner_id',
            select: 'profile.full_name profile.avatar_url'
        });
    } else {
        // Lấy bảng xếp hạng tổng số XP
        leaderboard = await Pet.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: 'dailyquests',
                    let: { petId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$pet_id', '$$petId'] },
                                        { $eq: ['$status', 'COMPLETED'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'completedQuests'
                }
            },
            {
                $addFields: {
                    'stats.challenges_won': { $size: '$completedQuests' }
                }
            },
            { $sort: { 'stats.xp': -1 } },
            { $limit: 20 }
        ]);

        leaderboard = await Pet.populate(leaderboard, {
            path: 'owner_id',
            select: 'profile.full_name profile.avatar_url'
        });
    }

    let currentPetRank = null;
    let currentPetData = null;

    if (currentPetId && mongoose.Types.ObjectId.isValid(currentPetId)) {
        try {
            const pet = await Pet.findById(currentPetId);
            if (pet) {
                let petXp = pet.stats?.xp || 0;
                let challengesWon = 0;

                if (startDate) {
                    const DailyQuest = mongoose.model('DailyQuest');
                    const completedQuests = await DailyQuest.find({
                        pet_id: currentPetId,
                        status: 'COMPLETED',
                        completed_at: { $gte: startDate }
                    });
                    petXp = completedQuests.reduce((sum, q) => sum + (q.reward_xp || 0), 0);
                    challengesWon = completedQuests.length;
                } else {
                    const DailyQuest = mongoose.model('DailyQuest');
                    challengesWon = await DailyQuest.countDocuments({
                        pet_id: currentPetId,
                        status: 'COMPLETED'
                    });
                }

                const petObj = pet.toObject();
                petObj.stats = {
                    ...petObj.stats,
                    xp: petXp,
                    challenges_won: challengesWon
                };
                currentPetData = petObj;

                if (startDate) {
                    const rankAggregate = await Pet.aggregate([
                        { $match: filter },
                        {
                            $lookup: {
                                from: 'dailyquests',
                                let: { petId: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ['$pet_id', '$$petId'] },
                                                    { $eq: ['$status', 'COMPLETED'] },
                                                    { $gte: ['$completed_at', startDate] }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                as: 'completedQuests'
                            }
                        },
                        {
                            $addFields: {
                                periodXp: { $sum: '$completedQuests.reward_xp' }
                            }
                        },
                        {
                            $match: {
                                periodXp: { $gt: petXp }
                            }
                        },
                        {
                            $count: 'count'
                        }
                    ]);
                    const higherCount = rankAggregate.length > 0 ? rankAggregate[0].count : 0;
                    currentPetRank = higherCount + 1;
                } else {
                    const higherXpFilter = {
                        ...filter,
                        'stats.xp': { $gt: petXp }
                    };
                    const rankCount = await Pet.countDocuments(higherXpFilter);
                    currentPetRank = rankCount + 1;
                }
            }
        } catch (err) {
            console.error('Error calculating current pet rank:', err);
        }
    }

    res.json({
        success: true,
        data: {
            leaderboard,
            currentPetRank,
            currentPetData
        }
    });
});

