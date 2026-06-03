const { DailyQuest, VetKnowledge, HealthLog, WeeklyQuest, User } = require('../models');

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

    // Lấy thông tin gói cước của User sở hữu thú cưng
    const owner = await User.findById(pet.owner_id);
    const ownerPlan = owner ? owner.subscription_plan : 'FREE';
    
    // Kiểm tra xem gói VIP có còn hiệu lực hay không (nếu có hạn thì phải chưa quá hạn)
    const hasActiveVipPlan = ownerPlan === 'VIP' && 
                             (!owner.subscription_expires_at || new Date(owner.subscription_expires_at) > new Date());
                             
    const hasActiveVipStatus = owner && owner.is_vip && 
                               (!owner.vip_expires_at || new Date(owner.vip_expires_at) > new Date());

    const isVip = !!(hasActiveVipPlan || hasActiveVipStatus);

    // Nếu đã có nhiệm vụ nhưng là của tài khoản FREE, nay chủ nuôi đã nâng cấp VIP -> Tiến hành xóa để sinh nhiệm vụ VIP mới
    if (quests.length > 0 && isVip) {
        const totalXp = quests.reduce((sum, q) => sum + (q.reward_xp || 0), 0);
        if (totalXp <= 100) {
            await DailyQuest.deleteMany({
                pet_id: pet._id,
                assigned_date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            });
            quests = [];
        }
    }

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

        // CHỈ CÓ VIP MỚI NHẬN ĐƯỢC NHIỆM VỤ CÁ NHÂN HÓA SÂU & GIỐNG LOÀI
        if (isVip) {
            // 1.5. Tạo nhiệm vụ cá nhân hóa theo tuổi, tình trạng sức khỏe và chỉ số sức khỏe gần nhất
            const dob = pet.dob ? new Date(pet.dob) : new Date();
            const ageInMonths = Math.max(0, Math.floor((startOfDay - dob) / (1000 * 60 * 60 * 24 * 30.4375)));
            const latestHealthLog = await HealthLog.findOne({ pet_id: pet._id }).sort({ measured_at: -1 });

            let personalizedQuest = null;

            if (latestHealthLog && latestHealthLog.temperature && latestHealthLog.temperature > 39.2) {
                // Trường hợp sốt
                personalizedQuest = {
                    pet_id: pet._id,
                    assigned_date: startOfDay,
                    title: `Hạ nhiệt và bù nước cho ${pet.name}`,
                    description: `Thân nhiệt gần nhất là ${latestHealthLog.temperature}°C (Cao). Hãy cho bé nằm phòng mát, bổ sung Oresol pha loãng và chườm ấm nách/bẹn.`,
                    category: 'HEALTH_CARE',
                    status: 'PENDING'
                };
            } else if (latestHealthLog && latestHealthLog.heart_rate && (
                (pet.species === 'DOG' && latestHealthLog.heart_rate > 140) ||
                (pet.species === 'CAT' && latestHealthLog.heart_rate > 220)
            )) {
                // Trường hợp nhịp tim nhanh bất thường lúc nghỉ
                personalizedQuest = {
                    pet_id: pet._id,
                    assigned_date: startOfDay,
                    title: `Thư giãn giảm nhịp tim cho ${pet.name}`,
                    description: `Nhịp tim gần nhất đo được là ${latestHealthLog.heart_rate} bpm (Cao). Cần tạo không gian yên tĩnh, tránh tiếng ồn lớn và vuốt ve bé nhẹ nhàng.`,
                    category: 'HEALTH_CARE',
                    status: 'PENDING'
                };
            } else if (pet.health_status === 'OVERWEIGHT' || (latestHealthLog && pet.weight && latestHealthLog.weight > pet.weight * 1.15)) {
                // Thừa cân béo phì
                if (pet.species === 'DOG') {
                    personalizedQuest = {
                        pet_id: pet._id,
                        assigned_date: startOfDay,
                        title: `Đi bộ nhanh giảm cân cho ${pet.name}`,
                        description: `Thực hiện bài đi bộ nhanh/chạy bộ kéo dài 25-30 phút để đốt mỡ thừa. Giảm nhẹ 10% lượng hạt ăn tối.`,
                        category: 'HEALTH_CARE',
                        status: 'PENDING'
                    };
                } else {
                    personalizedQuest = {
                        pet_id: pet._id,
                        assigned_date: startOfDay,
                        title: `Vận động giảm cân cho ${pet.name}`,
                        description: `Chơi đùa cùng ${pet.name} bằng cần câu lông vũ hoặc đèn laser 15-20 phút để kích thích bé nhảy và chạy giảm mỡ.`,
                        category: 'HEALTH_CARE',
                        status: 'PENDING'
                    };
                }
            } else if (pet.health_status === 'UNDERWEIGHT') {
                // Thiếu cân
                personalizedQuest = {
                    pet_id: pet._id,
                    assigned_date: startOfDay,
                    title: `Bồi bổ bữa phụ cho ${pet.name}`,
                    description: `Bổ sung bữa phụ giàu đạm (như ức gà luộc xé nhỏ hoặc pate phục hồi) kèm men tiêu hóa để hỗ trợ tăng cân.`,
                    category: 'NUTRITION',
                    status: 'PENDING'
                };
            } else if (ageInMonths <= 12) {
                // Thú non (Dưới 1 tuổi)
                personalizedQuest = {
                    pet_id: pet._id,
                    assigned_date: startOfDay,
                    title: `Bổ sung Canxi & Tập thói quen`,
                    description: `Bổ sung sữa dinh dưỡng hoặc Canxi Nano vào bữa sáng. Tập phản xạ lăn hoặc bắt bóng nhẹ nhàng cho bé cưng đang phát triển.`,
                    category: 'HEALTH_CARE',
                    status: 'PENDING'
                };
            } else if (ageInMonths >= 96) {
                // Thú già (Trên 8 tuổi)
                personalizedQuest = {
                    pet_id: pet._id,
                    assigned_date: startOfDay,
                    title: `Chăm sóc xương khớp cho ${pet.name}`,
                    description: `Bổ sung Glucosamine hoặc Omega-3 vào bữa ăn. Thực hiện xoa bóp, mát-xa nhẹ các khớp chân giúp ${pet.name} giảm nhức mỏi khớp.`,
                    category: 'HEALTH_CARE',
                    status: 'PENDING'
                };
            } else if (!latestHealthLog || (startOfDay - new Date(latestHealthLog.measured_at)) > 7 * 24 * 60 * 60 * 1000) {
                // Quá 7 ngày chưa đo sức khỏe
                personalizedQuest = {
                    pet_id: pet._id,
                    assigned_date: startOfDay,
                    title: `Đo lường sức khỏe cho ${pet.name}`,
                    description: `Đã hơn 7 ngày chưa cập nhật chỉ số sức khỏe của ${pet.name}. Hãy cân cân nặng, kiểm tra nhịp tim và lưu vào Health Dashboard hôm nay nhé.`,
                    category: 'HEALTH_CARE',
                    status: 'PENDING'
                };
            }

            if (personalizedQuest) {
                defaultQuests.push(personalizedQuest);
            }

            // 2. Lấy một bài VetKnowledge tương ứng giống loài (breed) để tạo nhiệm vụ đặc biệt
            let knowledge = null;
            if (pet.breed) {
                const breedMatchCount = await VetKnowledge.countDocuments({
                    is_active: true,
                    'target_audience.breed': pet.breed,
                    $or: [
                        { 'target_audience.species': pet.species },
                        { 'target_audience.species': 'ALL' }
                    ]
                });
                
                if (breedMatchCount > 0) {
                    const randomIndex = Math.floor(Math.random() * breedMatchCount);
                    knowledge = await VetKnowledge.findOne({
                        is_active: true,
                        'target_audience.breed': pet.breed,
                        $or: [
                            { 'target_audience.species': pet.species },
                            { 'target_audience.species': 'ALL' }
                        ]
                    }).skip(randomIndex);
                }
            }

            // Fallback về ALL nếu không tìm thấy giống cụ thể
            if (!knowledge) {
                const genericMatchCount = await VetKnowledge.countDocuments({
                    is_active: true,
                    'target_audience.breed': 'ALL',
                    $or: [
                        { 'target_audience.species': pet.species },
                        { 'target_audience.species': 'ALL' }
                    ]
                });
                
                if (genericMatchCount > 0) {
                    const randomIndex = Math.floor(Math.random() * genericMatchCount);
                    knowledge = await VetKnowledge.findOne({
                        is_active: true,
                        'target_audience.breed': 'ALL',
                        $or: [
                            { 'target_audience.species': pet.species },
                            { 'target_audience.species': 'ALL' }
                        ]
                    }).skip(randomIndex);
                }
            }

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
        }

        // PHÂN CHIA EXP VÀ COIN ĐỂ ĐẢM BẢO TỔNG SỐ KHÔNG ĐỔI MỖI NGÀY
        const N = defaultQuests.length;
        if (N > 0) {
            const DAILY_EXP_LIMIT = isVip ? 200 : 100;
            const DAILY_COIN_LIMIT = isVip ? 40 : 20;

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

const ensureWeeklyQuestsForPet = async (pet, period = 'WEEKLY', date = new Date()) => {
    const targetDate = new Date(date);
    let start, end;

    if (period === 'WEEKLY') {
        const day = targetDate.getDay();
        const diff = targetDate.getDate() - (day === 0 ? 6 : day - 1);
        start = new Date(targetDate.getFullYear(), targetDate.getMonth(), diff, 0, 0, 0, 0);
        end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
    } else if (period === 'MONTHLY') {
        start = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1, 0, 0, 0, 0);
        end = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (period === 'ANNUAL') {
        start = new Date(targetDate.getFullYear(), 0, 1, 0, 0, 0, 0);
        end = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else {
        period = 'WEEKLY';
        const day = targetDate.getDay();
        const diff = targetDate.getDate() - (day === 0 ? 6 : day - 1);
        start = new Date(targetDate.getFullYear(), targetDate.getMonth(), diff, 0, 0, 0, 0);
        end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
    }

    let quests = await WeeklyQuest.find({
        pet_id: pet._id,
        period: period,
        week_start: start
    });

    if (quests.length === 0) {
        const listToCreate = [];

        if (period === 'WEEKLY') {
            listToCreate.push({
                pet_id: pet._id,
                week_start: start,
                week_end: end,
                title: `Tắm sạch & Chải lông cho ${pet.name}`,
                description: `Tắm bằng dầu tắm chuyên dụng, sấy thật khô lông và chải lông sạch rác bụi để phòng tránh nấm rận kẽ da.`,
                category: 'DAILY_ROUTINE',
                period: 'WEEKLY',
                reward_xp: 150,
                reward_coin: 30
            });
            listToCreate.push({
                pet_id: pet._id,
                week_start: start,
                week_end: end,
                title: `Cắt móng & Vệ sinh tai cho ${pet.name}`,
                description: `Dùng bấm móng chuyên dụng cắt nhẹ phần đầu móng sắc nhọn. Lau sạch vành tai và ống tai bằng nước rửa tai chuyên dụng thấm bông gòn.`,
                category: 'HEALTH_CARE',
                period: 'WEEKLY',
                reward_xp: 100,
                reward_coin: 20
            });

            if (pet.species === 'DOG') {
                listToCreate.push({
                    pet_id: pet._id,
                    week_start: start,
                    week_end: end,
                    title: `Tắm nắng & Vận động dã ngoại`,
                    description: `Dành 1 buổi cuối tuần dắt cún cưng đi dã ngoại hoặc chạy bộ ngoài trời đón ánh nắng giúp tổng hợp Vitamin D và giải phóng năng lượng.`,
                    category: 'DAILY_ROUTINE',
                    period: 'WEEKLY',
                    reward_xp: 120,
                    reward_coin: 25
                });
            } else if (pet.species === 'CAT') {
                listToCreate.push({
                    pet_id: pet._id,
                    week_start: start,
                    week_end: end,
                    title: `Khử trùng & Phơi nắng khay cát`,
                    description: `Đổ toàn bộ cát cũ, rửa sạch khay bằng dung dịch sát khuẩn dịu nhẹ, phơi khô dưới nắng giòn 1 tiếng để diệt khuẩn hoàn toàn.`,
                    category: 'DAILY_ROUTINE',
                    period: 'WEEKLY',
                    reward_xp: 120,
                    reward_coin: 25
                });
            }
        } else if (period === 'MONTHLY') {
            listToCreate.push({
                pet_id: pet._id,
                week_start: start,
                week_end: end,
                title: `Tẩy giun định kỳ cho ${pet.name}`,
                description: `Cho uống thuốc tẩy giun định kỳ theo đúng liều lượng cân nặng của bé. Ghi nhớ ngày tiêm và theo dõi phân trong 24h.`,
                category: 'HEALTH_CARE',
                period: 'MONTHLY',
                reward_xp: 300,
                reward_coin: 50
            });
            listToCreate.push({
                pet_id: pet._id,
                week_start: start,
                week_end: end,
                title: `Cân đo & Cập nhật thể trạng`,
                description: `Ghi nhận chính xác Cân nặng, Chiều cao của ${pet.name} lên Health Dashboard để hệ thống đánh giá tiến trình phát triển và điều chỉnh Calo.`,
                category: 'HEALTH_CARE',
                period: 'MONTHLY',
                reward_xp: 150,
                reward_coin: 30
            });
        } else if (period === 'ANNUAL') {
            listToCreate.push({
                pet_id: pet._id,
                week_start: start,
                week_end: end,
                title: `Tiêm phòng dại định kỳ cho ${pet.name}`,
                description: `Đưa bé tới phòng khám thú y để tiêm vaccine phòng dại nhắc lại hằng năm. Cập nhật sổ tiêm vaccine lên ứng dụng.`,
                category: 'HEALTH_CARE',
                period: 'ANNUAL',
                reward_xp: 1000,
                reward_coin: 100
            });
            listToCreate.push({
                pet_id: pet._id,
                week_start: start,
                week_end: end,
                title: `Khám sức khỏe tổng quát hằng năm`,
                description: `Đưa bé tới trung tâm y tế thú y làm xét nghiệm máu, siêu âm và kiểm tra răng miệng tổng quát phòng ngừa bệnh mãn tính.`,
                category: 'HEALTH_CARE',
                period: 'ANNUAL',
                reward_xp: 800,
                reward_coin: 80
            });
        }

        await WeeklyQuest.insertMany(listToCreate);

        quests = await WeeklyQuest.find({
            pet_id: pet._id,
            period: period,
            week_start: start
        });
    }

    return quests;
};

module.exports = {
    ensureDailyQuestsForPet,
    ensureWeeklyQuestsForPet
};
