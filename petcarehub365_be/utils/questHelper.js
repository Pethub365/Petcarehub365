const moment = require('moment-timezone');
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

const ensureDailyQuestsForPet = async (pet, date = new Date(), reqTimezone = 'Asia/Ho_Chi_Minh') => {
    const userNow = date ? moment.tz(date, reqTimezone) : moment.tz(reqTimezone);
    const startOfDay = userNow.clone().startOf('day').toDate();
    const endOfDay = userNow.clone().endOf('day').toDate();

    let quests = await DailyQuest.find({
        pet_id: pet._id,
        assigned_date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    }).populate('source_knowledge_id').populate('assigned_to', 'email profile');

    // Lấy thông tin gói cước của User sở hữu thú cưng
    const owner = await User.findById(pet.owner_id);
    const ownerPlan = owner ? owner.subscription_plan : 'FREE';

    // Kiểm tra xem gói VIP có còn hiệu lực hay không (nếu có hạn thì phải chưa quá hạn)
    const hasActiveVipPlan = ownerPlan === 'VIP' &&
        (!owner.subscription_expires_at || new Date(owner.subscription_expires_at) > new Date());

    const hasActiveVipStatus = owner && owner.is_vip &&
        (!owner.vip_expires_at || new Date(owner.vip_expires_at) > new Date());

    // Kiểm tra xem thú cưng có thuộc một nhóm gia đình nào mà có ít nhất một thành viên sở hữu VIP hay không
    let isFamilyVip = false;
    try {
        const { FamilyGroup } = require('../models');
        const familyGroup = await FamilyGroup.findOne({ pet_ids: pet._id });
        if (familyGroup) {
            const memberIds = familyGroup.members.map(m => m.user_id);
            const vipMembers = await User.find({
                _id: { $in: memberIds },
                $or: [
                    { subscription_plan: 'VIP', $or: [{ subscription_expires_at: null }, { subscription_expires_at: { $gt: new Date() } }] },
                    { is_vip: true, $or: [{ vip_expires_at: null }, { vip_expires_at: { $gt: new Date() } }] }
                ]
            });
            if (vipMembers.length > 0) {
                isFamilyVip = true;
            }
        }
    } catch (err) {
        console.error('Lỗi khi kiểm tra VIP của nhóm gia đình:', err);
    }

    const isVip = !!(hasActiveVipPlan || hasActiveVipStatus || isFamilyVip);

    // Nếu đã có nhiệm vụ nhưng là của tài khoản FREE, nay chủ nuôi đã nâng cấp VIP -> Tiến hành sinh và bổ sung nhiệm vụ VIP mới (không xoá nhiệm vụ cũ để tránh mất tiến trình)
    if (quests.length > 0 && isVip) {
        const standardTitles = [
            'Bữa sáng dinh dưỡng',
            'Bữa trưa dinh dưỡng',
            'Bữa tối ấm cúng',
            'Đi dạo buổi sáng',
            'Dọn dẹp khay vệ sinh'
        ];
        const hasVipQuests = quests.some(q => q.source_knowledge_id || !standardTitles.includes(q.title));
        
        if (!hasVipQuests) {
            const vipQuestsToCreate = [];

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
                vipQuestsToCreate.push(personalizedQuest);
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
                vipQuestsToCreate.push({
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
                    },
                    reward_xp: knowledge.base_reward_xp
                });
            }

            // Cố định phần thưởng XP và Coins theo độ khó/danh mục của từng nhiệm vụ
            const xpMap = {
                'NUTRITION': 15,
                'DAILY_ROUTINE': 30,
                'TRAINING': 40,
                'HEALTH_CARE': 50
            };
            const coinMap = {
                'NUTRITION': 5,
                'DAILY_ROUTINE': 10,
                'TRAINING': 15,
                'HEALTH_CARE': 15
            };

            for (let i = 0; i < vipQuestsToCreate.length; i++) {
                const q = vipQuestsToCreate[i];
                q.reward_xp = q.reward_xp || xpMap[q.category] || 30;
                q.reward_coin = q.reward_coin || coinMap[q.category] || 10;
            }

            if (vipQuestsToCreate.length > 0) {
                await DailyQuest.insertMany(vipQuestsToCreate);
                // Cập nhật lại danh sách quests để bao gồm cả nhiệm vụ VIP mới tạo
                quests = await DailyQuest.find({
                    pet_id: pet._id,
                    assigned_date: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                }).populate('source_knowledge_id').populate('assigned_to', 'email profile');
            }
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
                status: 'PENDING',
                valid_from_hour: 5,
                valid_until_hour: 12
            },
            {
                pet_id: pet._id,
                assigned_date: startOfDay,
                title: 'Bữa trưa dinh dưỡng',
                description: `Cho ${pet.name} ăn bữa trưa nhẹ nhàng hoặc hạt dinh dưỡng đúng giờ.`,
                category: 'NUTRITION',
                status: 'PENDING',
                valid_from_hour: 12,
                valid_until_hour: 18
            },
            {
                pet_id: pet._id,
                assigned_date: startOfDay,
                title: 'Bữa tối ấm cúng',
                description: `Cho ${pet.name} ăn bữa tối đúng giờ và rửa sạch bát ăn.`,
                category: 'NUTRITION',
                status: 'PENDING',
                valid_from_hour: 18,
                valid_until_hour: 24
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
                    },
                    reward_xp: knowledge.base_reward_xp
                });
            }
        }

        // Cố định phần thưởng XP và Coins theo độ khó/danh mục của từng nhiệm vụ thay vì chia đều
        const xpMap = {
            'NUTRITION': 15,
            'DAILY_ROUTINE': 30,
            'TRAINING': 40,
            'HEALTH_CARE': 50
        };
        const coinMap = {
            'NUTRITION': 5,
            'DAILY_ROUTINE': 10,
            'TRAINING': 15,
            'HEALTH_CARE': 15
        };

        for (let i = 0; i < defaultQuests.length; i++) {
            const q = defaultQuests[i];
            q.reward_xp = q.reward_xp || xpMap[q.category] || 30;
            q.reward_coin = q.reward_coin || coinMap[q.category] || 10;
        }

        quests = await DailyQuest.insertMany(defaultQuests);

        quests = await DailyQuest.find({
            pet_id: pet._id,
            assigned_date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).populate('source_knowledge_id').populate('assigned_to', 'email profile');
    }

    // Tự động kiểm tra và chuyển các nhiệm vụ PENDING quá hạn thành MISSED
    const now = new Date();
    const isToday = now.getFullYear() === startOfDay.getFullYear() &&
        now.getMonth() === startOfDay.getMonth() &&
        now.getDate() === startOfDay.getDate();

    // Nếu là ngày cũ, giả định giờ hiện tại là 24 để đánh dấu MISSED hết các quest PENDING quá hạn
    const currentHour = isToday ? now.getHours() : 24;
    let hasUpdates = false;

    for (let i = 0; i < quests.length; i++) {
        const q = quests[i];
        if (q.status === 'PENDING' && q.valid_until_hour !== null && q.valid_until_hour !== undefined) {
            if (currentHour >= q.valid_until_hour) {
                q.status = 'MISSED';
                await q.save();
                hasUpdates = true;
            }
        }
    }

    if (hasUpdates) {
        quests = await DailyQuest.find({
            pet_id: pet._id,
            assigned_date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).populate('source_knowledge_id').populate('assigned_to', 'email profile');
    }

    // Lọc chỉ trả về các nhiệm vụ đã đến giờ hiển thị
    const filteredQuests = quests.filter(q => {
        if (q.valid_from_hour !== null && q.valid_from_hour !== undefined) {
            return currentHour >= q.valid_from_hour;
        }
        return true;
    });

    return filteredQuests;
};

const ensureWeeklyQuestsForPet = async (pet, period = 'WEEKLY', date = new Date(), reqTimezone = 'Asia/Ho_Chi_Minh') => {
    const userNow = date ? moment.tz(date, reqTimezone) : moment.tz(reqTimezone);
    let start, end;

    if (period === 'WEEKLY') {
        start = userNow.clone().startOf('isoWeek').toDate(); // Thứ Hai 00:00:00
        end = userNow.clone().endOf('isoWeek').toDate();     // Chủ Nhật 23:59:59
    } else if (period === 'MONTHLY') {
        start = userNow.clone().startOf('month').toDate();   // Ngày 1 đầu tháng
        end = userNow.clone().endOf('month').toDate();
    } else if (period === 'ANNUAL') {
        start = userNow.clone().startOf('year').toDate();    // Ngày 1/1 đầu năm
        end = userNow.clone().endOf('year').toDate();
    } else {
        period = 'WEEKLY';
        start = userNow.clone().startOf('isoWeek').toDate();
        end = userNow.clone().endOf('isoWeek').toDate();
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
