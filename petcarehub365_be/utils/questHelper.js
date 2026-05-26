const { DailyQuest, VetKnowledge } = require('../models');

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

const ensureDailyQuestsForPet = async (pet, date = new Date()) => {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    let quests = await DailyQuest.find({
        pet_id: pet._id,
        assigned_date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    }).populate('source_knowledge_id');

    if (quests.length === 0) {
        await seedDefaultKnowledge();

        // 1. Tạo các nhiệm vụ tiêu chuẩn
        const defaultQuests = [
            {
                pet_id: pet._id,
                assigned_date: startOfDay,
                title: 'Bữa sáng dinh dưỡng',
                description: `Cho ${pet.name} ăn hạt dinh dưỡng hoặc thức ăn ướt phù hợp, cùng nước sạch.`,
                category: 'NUTRITION',
                status: 'PENDING'
            },
            {
                pet_id: pet._id,
                assigned_date: startOfDay,
                title: 'Bữa tối ấm cúng',
                description: `Cho ${pet.name} ăn bữa tối đúng giờ và rửa sạch bát ăn.`,
                category: 'NUTRITION',
                status: 'PENDING'
            }
        ];

        // Dựa vào loài thú cưng để thêm đi dạo hoặc dọn dẹp khay vệ sinh
        if (pet.species === 'DOG') {
            defaultQuests.push({
                pet_id: pet._id,
                assigned_date: startOfDay,
                title: 'Đi dạo buổi sáng',
                description: `Dắt ${pet.name} đi dạo xung quanh công viên hoặc khu dân cư để vận động.`,
                category: 'DAILY_ROUTINE',
                status: 'PENDING'
            });
        } else if (pet.species === 'CAT') {
            defaultQuests.push({
                pet_id: pet._id,
                assigned_date: startOfDay,
                title: 'Dọn dẹp khay vệ sinh',
                description: `Sàng khay cát vệ sinh của ${pet.name} để đảm bảo sạch sẽ và khử mùi.`,
                category: 'DAILY_ROUTINE',
                status: 'PENDING'
            });
        }

        // 2. Lấy một bài VetKnowledge tương ứng loài và thể trạng để tạo nhiệm vụ đặc biệt
        const knowledge = await VetKnowledge.findOne({
            is_active: true,
            $or: [
                { 'target_audience.species': pet.species },
                { 'target_audience.species': 'ALL' }
            ]
        });

        if (knowledge) {
            defaultQuests.push({
                pet_id: pet._id,
                assigned_date: startOfDay,
                source_knowledge_id: knowledge._id,
                title: knowledge.title,
                description: `${knowledge.recommended_action}\n(Cơ sở y khoa: ${knowledge.medical_fact})`,
                category: knowledge.category === 'BEHAVIOR' ? 'TRAINING' : knowledge.category,
                status: 'PENDING',
                suggested_action: {
                    has_product: !!knowledge.related_product_metadata?.product_category,
                    product_query_tag: knowledge.related_product_metadata?.product_category || null
                }
            });
        }

        // PHÂN CHIA EXP VÀ COIN ĐỂ ĐẢM BẢO TỔNG SỐ KHÔNG ĐỔI MỖI NGÀY (VÀ DO ĐÓ MỖI TUẦN)
        const N = defaultQuests.length;
        if (N > 0) {
            const DAILY_EXP_LIMIT = 120;
            const DAILY_COIN_LIMIT = 30;

            const baseXp = Math.floor(DAILY_EXP_LIMIT / N);
            const baseCoin = Math.floor(DAILY_COIN_LIMIT / N);

            let remainingXp = DAILY_EXP_LIMIT - (baseXp * N);
            let remainingCoin = DAILY_COIN_LIMIT - (baseCoin * N);

            for (let i = 0; i < N; i++) {
                defaultQuests[i].reward_xp = baseXp + (remainingXp > 0 ? 1 : 0);
                defaultQuests[i].reward_coin = baseCoin + (remainingCoin > 0 ? 1 : 0);
                if (remainingXp > 0) remainingXp--;
                if (remainingCoin > 0) remainingCoin--;
            }
        }

        quests = await DailyQuest.insertMany(defaultQuests);
        
        quests = await DailyQuest.find({
            pet_id: pet._id,
            assigned_date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).populate('source_knowledge_id');
    }

    return quests;
};

module.exports = {
    ensureDailyQuestsForPet
};
