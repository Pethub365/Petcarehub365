const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { VetKnowledge } = require('./models');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://LeNgoc_db_user:1234567890@cluster0.sowj9aw.mongodb.net/PetcareHub365DB?retryWrites=true&w=majority&appName=Cluster0';

const knowledgeData = [
  // ==========================================
  // 1. POODLE (DOG)
  // ==========================================
  {
    title: 'Vệ sinh tai cho Poodle ngừa nấm Malassezia',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'DOG',
      breed: 'Poodle',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Tai Poodle dài và cụp làm giảm lưu thông khí, dễ giữ ẩm tạo môi trường cho nấm Malassezia phát triển.',
    recommended_action: 'Nhổ bớt lông tai thừa bằng bột nhổ lông tai, nhỏ dung dịch vệ sinh tai chứa acid acetic và lau sạch vành tai ngoài.',
    related_product_metadata: { product_category: 'ear_cleaner', promo_code: 'POODLETAI10' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Chải lông gỡ rối phòng ngừa viêm da Poodle',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'DOG',
      breed: 'Poodle',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Lông Poodle xoăn và không tự rụng, rất dễ rối bết, giữ ẩm dẫn đến viêm da kẽ lông nếu không chải.',
    recommended_action: 'Dùng lược ghim (slicker brush) chải nhẹ nhàng toàn bộ lông từ gốc đến ngọn mỗi ngày một lần.',
    related_product_metadata: { product_category: 'slicker_brush', promo_code: 'POODLEL0NG15' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Làm sạch gỉ mắt Poodle ngừa ố vàng lông',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'DOG',
      breed: 'Poodle',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Poodle có tuyến nước mắt hoạt động mạnh, ống lệ hẹp làm nước mắt đọng lâu ngày gây ố lông và viêm khóe mắt.',
    recommended_action: 'Dùng khăn ướt chuyên dụng hoặc tăm bông thấm nước muối sinh lý lau nhẹ vùng quanh mắt mỗi sáng.',
    related_product_metadata: { product_category: 'eye_wipes', promo_code: 'POODLEMAT10' },
    base_reward_xp: 20,
    is_active: true
  },
  {
    title: 'Đánh răng cho Poodle tránh viêm nha chu',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'DOG',
      breed: 'Poodle',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Hàm nhỏ và răng mọc khít ở Poodle làm thức ăn thừa dễ bám lại, gây mảng bám và viêm nha chu sớm.',
    recommended_action: 'Dùng bàn chải mềm và kem đánh răng chuyên dụng cho chó để chải răng ít nhất 3 lần một tuần.',
    related_product_metadata: { product_category: 'dog_toothpaste', promo_code: 'POODLERANG12' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Cắt tỉa móng chân Poodle phòng lệch ngón',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'DOG',
      breed: 'Poodle',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Móng chân Poodle dài nhanh, nếu chạm đất sẽ đẩy ngón chân ngược lên gây đau khớp gối và lệch dáng đi.',
    recommended_action: 'Dùng kìm bấm móng cắt nhẹ đầu móng nhọn mỗi 2 tuần, tránh phạm vào phần tủy hồng.',
    related_product_metadata: { product_category: 'nail_clipper', promo_code: 'POODLEMONG5' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Huấn luyện Poodle giảm lo âu chia ly',
    category: 'BEHAVIOR',
    target_audience: {
      species: 'DOG',
      breed: 'Poodle',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Poodle rất quấn chủ và có mức độ lo âu chia ly cao, dẫn đến sủa dai dẳng và cắn phá khi ở một mình.',
    recommended_action: 'Huấn luyện cún tự chơi một mình bằng bài tập rời phòng từ 1-5 phút và nâng dần thời gian, thưởng khi cún im lặng.',
    related_product_metadata: { product_category: 'dog_treat', promo_code: 'POODLETREAT8' },
    base_reward_xp: 40,
    is_active: true
  },
  {
    title: 'Bổ sung Canxi & Dầu cá cho Poodle ngừa trật khớp',
    category: 'NUTRITION',
    target_audience: {
      species: 'DOG',
      breed: 'Poodle',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Poodle nhỏ có xương chân mảnh, rất dễ gặp chấn thương trật khớp xương bánh chè (Patellar Luxation) di truyền.',
    recommended_action: 'Trộn bột canxi nano hoặc dầu cá vào khẩu phần ăn để tăng mật độ xương và bôi trơn khớp đầu gối.',
    related_product_metadata: { product_category: 'calcium_supplement', promo_code: 'POODLEXUONG20' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Vắt tuyến hôi hậu môn Poodle phòng viêm',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'DOG',
      breed: 'Poodle',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Tuyến hôi tích dịch nếu không được giải phóng tự nhiên khi đi ngoài sẽ bị tắc nghẽn, gây viêm và rò hậu môn.',
    recommended_action: 'Vắt nhẹ tuyến hôi ở góc 4 giờ và 8 giờ quanh hậu môn của cún khi tắm định kỳ mỗi tháng một lần.',
    related_product_metadata: { product_category: 'pet_shampoo', promo_code: 'POODLESHAMP10' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Trò chơi kích thích trí não Poodle',
    category: 'TRAINING',
    target_audience: {
      species: 'DOG',
      breed: 'Poodle',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Poodle cực kỳ thông minh (top 2), nếu không được kích thích trí tuệ sẽ dễ bị buồn chán và sinh hành vi xấu.',
    recommended_action: 'Giấu hạt thức ăn vào các ngăn của thảm ngửi (snuffle mat) để cún dùng khứu giác tìm kiếm trong 10-15 phút.',
    related_product_metadata: { product_category: 'snuffle_mat', promo_code: 'POODLETOY15' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Tắm dưỡng lông mềm mượt cho Poodle',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'DOG',
      breed: 'Poodle',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Sợi lông xoăn của Poodle dễ khô xơ và bắt bụi. Dầu tắm thông thường làm mất đi lớp lipid tự nhiên bảo vệ da.',
    recommended_action: 'Tắm bằng dầu tắm dưỡng lông chuyên biệt cho cún lông xoăn, sấy khô hoàn toàn ngay sau khi tắm.',
    related_product_metadata: { product_category: 'shampoo_poodle', promo_code: 'POODLESPA15' },
    base_reward_xp: 30,
    is_active: true
  },

  // ==========================================
  // 2. GOLDEN RETRIEVER (DOG)
  // ==========================================
  {
    title: 'Bài tập bảo vệ khớp hông cho Golden Retriever',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'DOG',
      breed: 'Golden Retriever',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Golden Retriever rất dễ bị loạn sản khớp hông (Hip Dysplasia) do di truyền và tăng trưởng nhanh.',
    recommended_action: 'Thực hiện bài đi bộ nhẹ nhàng 20-30 phút trên nền đất bằng phẳng, tránh cho cún nhảy cao quá mức.',
    related_product_metadata: { product_category: 'joint_supplement', promo_code: 'GOLDENJOINT15' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Sấy lông sâu ngừa viêm da cho Golden',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'DOG',
      breed: 'Golden Retriever',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Lông kép của Golden giữ nước rất lâu, da ẩm ướt kéo dài dễ tạo các vết viêm rỉ dịch cấp tính (Hot Spots).',
    recommended_action: 'Sau khi bơi hoặc tắm, sấy thật khô lớp lông lót sát da bằng máy sấy công suất lớn chuyên dụng.',
    related_product_metadata: { product_category: 'pet_dryer', promo_code: 'GOLDENDRY10' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Golden ăn bằng bát ăn chậm ngừa chướng bụng',
    category: 'NUTRITION',
    target_audience: {
      species: 'DOG',
      breed: 'Golden Retriever',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Golden phàm ăn hay nuốt chửng, dễ dẫn đến xoắn dạ dày chướng hơi (GDV) cấp tính nguy hiểm tính mạng.',
    recommended_action: 'Sử dụng bát ăn chậm (slow feeder bowl) để hạn chế tốc độ nuốt và chia khẩu phần làm 2 bữa nhỏ/ngày.',
    related_product_metadata: { product_category: 'slow_feeder_bowl', promo_code: 'GOLDENBOWL12' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Trò chơi nhặt bóng cho Golden ngừa béo phì',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'DOG',
      breed: 'Golden Retriever',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Giống chó này có xu hướng dễ béo phì khi trưởng thành, làm tăng áp lực khủng khiếp lên các khớp chân.',
    recommended_action: 'Tổ chức trò chơi nhặt bóng (fetch) ngoài trời 20-30 phút mỗi ngày vào lúc sáng sớm hoặc chiều mát.',
    related_product_metadata: { product_category: 'dog_ball', promo_code: 'GOLDENBALL8' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Gạt lông rụng Golden chống bám bụi bẩn',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'DOG',
      breed: 'Golden Retriever',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Golden rụng lông lọi quanh năm, rụng cực nhiều vào mùa thay lông gây bám bụi và rác trên da lông.',
    recommended_action: 'Dùng lược gạt lông rụng (deshedding tool) chải sâu dọc cơ thể để loại bỏ lông chết tích tụ.',
    related_product_metadata: { product_category: 'deshedding_brush', promo_code: 'GOLDENBRUSH15' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Huấn luyện Golden đi dạo lỏng dây xích',
    category: 'TRAINING',
    target_audience: {
      species: 'DOG',
      breed: 'Golden Retriever',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Golden có kích thước lớn và lực kéo mạnh, nếu không huấn luyện sẽ gây kéo lê chủ và chấn thương vai.',
    recommended_action: 'Tập đi bên cạnh chủ, dừng lại ngay khi dây xích căng và thưởng hạt khi cún quay đầu lại nhìn bạn.',
    related_product_metadata: { product_category: 'dog_harness', promo_code: 'GOLDENHARN20' },
    base_reward_xp: 40,
    is_active: true
  },
  {
    title: 'Lau sạch tai Golden sau khi tiếp xúc nước',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'DOG',
      breed: 'Golden Retriever',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Tai cụp to kết hợp sở thích nghịch nước của Golden làm tăng độ ẩm loa tai, gây viêm tai nấm.',
    recommended_action: 'Lau sạch nước đọng và nhỏ 2-3 giọt dung dịch sấy tai chuyên dụng sau khi cún đi bơi hoặc tắm.',
    related_product_metadata: { product_category: 'ear_drying_drops', promo_code: 'GOLDENEAR10' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Bổ sung Omega-3 tăng cường đề kháng da Golden',
    category: 'NUTRITION',
    target_audience: {
      species: 'DOG',
      breed: 'Golden Retriever',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Da của Golden nhạy cảm, dễ dị ứng bọ chét. Axit béo Omega-3 giúp giảm phản ứng viêm và mẩn đỏ da.',
    recommended_action: 'Bổ sung dầu cá hồi nguyên chất vào bát ăn tối hằng ngày theo đúng liều lượng cân nặng.',
    related_product_metadata: { product_category: 'salmon_oil', promo_code: 'GOLDENOIL15' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Tỉa lông kẽ chân Golden tránh viêm kẽ ngón',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'DOG',
      breed: 'Golden Retriever',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Lông kẽ ngón mọc dài tích nước bẩn gây viêm da kẽ ngón (pododermatitis) và làm cún dễ trơn trượt trên sàn.',
    recommended_action: 'Dùng tông đơ nhỏ tỉa sát lông dưới đệm bàn chân và kẽ ngón, giữ chân cún khô ráo.',
    related_product_metadata: { product_category: 'paw_trimmer', promo_code: 'GOLDENPAW5' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Kiểm tra mắt Golden phòng đục thủy tinh thể',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'DOG',
      breed: 'Golden Retriever',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Golden nằm trong nhóm giống chó có tỷ lệ đục thủy tinh thể (Cataracts) sớm cao gây suy giảm thị lực.',
    recommended_action: 'Sử dụng đèn soi kiểm tra độ trong suốt con ngươi của cún định kỳ và đưa đi khám nếu thấy mống mắt mờ đục.',
    related_product_metadata: { product_category: 'eye_drops_preventive', promo_code: 'GOLDENEYE10' },
    base_reward_xp: 30,
    is_active: true
  },

  // ==========================================
  // 3. CORGI (DOG)
  // ==========================================
  {
    title: 'Kiểm soát cân nặng Corgi ngừa đau cột sống',
    category: 'NUTRITION',
    target_audience: {
      species: 'DOG',
      breed: 'Corgi',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Cấu trúc lưng dài chân ngắn làm cột sống Corgi chịu lực uốn lớn, béo phì sẽ gây thoát vị đĩa đệm (IVDD).',
    recommended_action: 'Định lượng thức ăn nghiêm ngặt, duy trì cân nặng lý tưởng, không để mỡ thừa tích tụ ở vùng bụng cún.',
    related_product_metadata: { product_category: 'pet_scale', promo_code: 'CORGISCALE10' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Huấn luyện Corgi hạn chế nhảy cao leo dốc',
    category: 'BEHAVIOR',
    target_audience: {
      species: 'DOG',
      breed: 'Corgi',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Hành vi nhảy từ sofa, giường cao hoặc chạy cầu thang dốc gây chấn thương nén cột sống lưng Corgi.',
    recommended_action: 'Dạy cún không tự ý nhảy lên/xuống giường, sử dụng cầu thang thoai thoải (ramp) chuyên dụng cho cún.',
    related_product_metadata: { product_category: 'pet_ramp', promo_code: 'CORGIRAMP15' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Chải cào lớp lông tơ Corgi thoát nhiệt',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'DOG',
      breed: 'Corgi',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Lông Corgi dày 2 lớp, lớp lông tơ sát da nếu bết sẽ giữ nhiệt cơ thể gây viêm da bã nhờn và sốc nhiệt.',
    recommended_action: 'Dùng lược cào lông lót (undercoat rake) chải dọc lưng và mông để kéo lông chết ra ngoài vào mùa nóng.',
    related_product_metadata: { product_category: 'undercoat_rake', promo_code: 'CORGIUNDER10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Tỉa lông quanh hậu môn Corgi giữ vệ sinh',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'DOG',
      breed: 'Corgi',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Corgi không đuôi/đuôi cụt có lông mông rất dày, dễ dính phân khi đi ngoài gây hôi và viêm nhiễm sinh dục.',
    recommended_action: 'Dùng kéo bo tròn đầu cắt tỉa ngắn lông vùng mông và quanh hậu môn của cún (vệ sinh sanitary).',
    related_product_metadata: { product_category: 'grooming_scissors', promo_code: 'CORGISCI12' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Dạy lệnh "Quiet" giảm sủa báo động cho Corgi',
    category: 'BEHAVIOR',
    target_audience: {
      species: 'DOG',
      breed: 'Corgi',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Corgi là chó chăn gia súc nên rất nhạy bén tiếng động, có xu hướng sủa to để cảnh giới gây ồn ào.',
    recommended_action: 'Khen thưởng bằng clicker và thức ăn ngay khi cún ngừng sủa theo lệnh "Yên lặng" để tạo phản xạ.',
    related_product_metadata: { product_category: 'training_clicker', promo_code: 'CORGICLICK10' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Bổ sung Glucosamine bảo vệ khớp lùn cho Corgi',
    category: 'NUTRITION',
    target_audience: {
      species: 'DOG',
      breed: 'Corgi',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Bốn chân ngắn nâng đỡ cơ thể dài khiến các đầu khớp chịu tải lớn, tăng tốc độ thoái hóa khớp khi già.',
    recommended_action: 'Bổ sung thực phẩm bảo vệ sụn khớp chứa Glucosamine và Chondroitin vào cữ ăn hằng ngày của cún.',
    related_product_metadata: { product_category: 'joint_glucosamine', promo_code: 'CORGIJOINT20' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Lau khô chân Corgi phòng nấm kẽ ngón',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'DOG',
      breed: 'Corgi',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Chân ngắn làm bụng và ngực Corgi sát đất, đi trên cỏ ướt dễ bị ẩm bám lâu ngày gây nấm kẽ chân.',
    recommended_action: 'Dùng khăn lau sạch bùn đất và sấy khô kẽ chân cún ngay sau khi đi dạo trời mưa hoặc sương ẩm.',
    related_product_metadata: { product_category: 'paw_balm', promo_code: 'CORGIPAW10' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Bài tập tăng cơ đùi nâng cột sống Corgi',
    category: 'TRAINING',
    target_audience: {
      species: 'DOG',
      breed: 'Corgi',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Cơ đùi sau và cơ hông khỏe mạnh giúp nâng đỡ một phần trọng lượng cột sống, giảm tải áp lực đĩa đệm.',
    recommended_action: 'Cho cún tập bài đi bộ chậm lên dốc nhẹ hoặc tập giữ thăng bằng trên bóng tập định kỳ 10 phút.',
    related_product_metadata: { product_category: 'balance_disc', promo_code: 'CORGIYOGA15' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Thay khay vệ sinh thành thấp cho Corgi',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'DOG',
      breed: 'Corgi',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Nhảy qua thành khay vệ sinh quá cao lặp đi lặp lại hằng ngày gây vi chấn thương lên khớp gối của Corgi.',
    recommended_action: 'Sử dụng khay vệ sinh có lối vào hạ thấp sát đất hoặc có độ dốc thoai thoải để cún ra vào dễ dàng.',
    related_product_metadata: { product_category: 'low_profile_litter_box', promo_code: 'CORGILIT10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Tầm soát DM (thoái hóa tủy) cho Corgi',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'DOG',
      breed: 'Corgi',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Giống Corgi có tỷ lệ cao mắc bệnh thoái hóa tủy (Degenerative Myelopathy) gây liệt dần hai chân sau.',
    recommended_action: 'Thực hiện xét nghiệm ADN phát hiện đột biến gen SOD1 trước khi cho phối giống hoặc làm kế hoạch lão khoa.',
    related_product_metadata: { product_category: 'dna_test_kit', promo_code: 'CORGIDNA25' },
    base_reward_xp: 40,
    is_active: true
  },

  // ==========================================
  // 4. HUSKY (DOG)
  // ==========================================
  {
    title: 'Bài tập giải phóng năng lượng lớn cho Husky',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'DOG',
      breed: 'Husky',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Husky có bản năng chạy bền dẻo dai của chó kéo xe, nếu bị giam giữ lâu ngày sẽ cắn phá đồ đạc dữ dội.',
    recommended_action: 'Dắt cún đi bộ nhanh hoặc chạy bộ tối thiểu 45-60 phút mỗi ngày ở nơi rộng rãi, mát mẻ.',
    related_product_metadata: { product_category: 'running_leash', promo_code: 'HUSKYRUN10' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Chải lông tơ mùa "thổi lông" của Husky',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'DOG',
      breed: 'Husky',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Husky thay lông tơ số lượng lớn 2 lần/năm (thổi lông), nếu không chải lông rụng sẽ kết tảng làm bí da.',
    recommended_action: 'Dùng lược gạt lông chết (Furminator) chải sâu để lấy các búi lông tơ rụng ra khỏi bộ lông dày.',
    related_product_metadata: { product_category: 'furminator', promo_code: 'HUSKYFUR15' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Chống nóng phòng sốc nhiệt cho Husky',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'DOG',
      breed: 'Husky',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Husky có hệ lông giữ ấm xứ lạnh nên khả năng thải nhiệt kém, dễ sốc nhiệt (Heatstroke) ở khí hậu nóng ẩm.',
    recommended_action: 'Cho cún nằm phòng máy lạnh hoặc lót thảm tản nhiệt vào những ngày hè nóng đỉnh điểm trên 35°C.',
    related_product_metadata: { product_category: 'cooling_mat', promo_code: 'HUSKYCOOL10' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Nhỏ mắt làm sạch giác mạc cho Husky',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'DOG',
      breed: 'Husky',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Husky dễ gặp chứng loạn dưỡng giác mạc tiến triển và đục thủy tinh thể thứ phát từ khi còn trẻ.',
    recommended_action: 'Nhỏ nước muối sinh lý làm sạch bụi bẩn ở khóe mắt mỗi ngày, quan sát độ trong suốt mắt cún dưới ánh sáng.',
    related_product_metadata: { product_category: 'eye_drops_pet', promo_code: 'HUSKYEYE12' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Huấn luyện Husky gọi cún quay lại (Recall)',
    category: 'TRAINING',
    target_audience: {
      species: 'DOG',
      breed: 'Husky',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Husky có bản năng săn mồi và tò mò rất cao, dễ mất kiểm soát chạy đi xa khi không đeo dây dắt.',
    recommended_action: 'Huấn luyện cún phản xạ quay lại khi gọi bằng dây dắt dài 10m ở bãi đất trống, thưởng cún hạt ngon.',
    related_product_metadata: { product_category: 'long_leash', promo_code: 'HUSKYBACK10' },
    base_reward_xp: 40,
    is_active: true
  },
  {
    title: 'Bổ sung Kẽm ngừa viêm da thiếu kẽm ở Husky',
    category: 'NUTRITION',
    target_audience: {
      species: 'DOG',
      breed: 'Husky',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Husky bị hội chứng hấp thu kẽm kém di truyền (Zinc-Responsive Dermatosis) gây rụng lông, vảy sừng quanh mõm, mắt.',
    recommended_action: 'Bổ sung kẽm hữu cơ vào thức ăn theo liều lượng tư vấn của bác sĩ y khoa thú y.',
    related_product_metadata: { product_category: 'zinc_supplement', promo_code: 'HUSKYZINC15' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Sử dụng đai yếm ngực an toàn cho Husky',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'DOG',
      breed: 'Husky',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Husky rất khỏe và là bậc thầy đào tẩu, có khả năng giật mạnh làm tuột vòng cổ thông thường rất nhanh.',
    recommended_action: 'Sử dụng đai yếm ngực 3 điểm khóa an toàn (escape-proof harness) khi dắt cún đi ra ngoài đường lớn.',
    related_product_metadata: { product_category: 'escape_proof_harness', promo_code: 'HUSKYSAFE15' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Cung cấp đồ chơi gặm nhai bền bỉ cho Husky',
    category: 'BEHAVIOR',
    target_audience: {
      species: 'DOG',
      breed: 'Husky',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Lực cắn của Husky lớn kết hợp tính hiếu động làm chúng thích gặm phá để giải tỏa năng lượng tích tụ.',
    recommended_action: 'Cung cấp các loại đồ chơi cao su tự nhiên siêu cứng chịu lực cắn tốt, nhồi pate đông lạnh bên trong.',
    related_product_metadata: { product_category: 'kong_toy', promo_code: 'HUSKYKONG10' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Huấn luyện Husky vượt chướng ngại vật ziczac',
    category: 'TRAINING',
    target_audience: {
      species: 'DOG',
      breed: 'Husky',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Bài tập vượt rào ziczac giúp kích thích tư duy làm việc của Husky, giảm bớt tính khí bướng bỉnh khó bảo.',
    recommended_action: 'Cho cún chạy qua các cọc tiêu ziczac và nhảy qua chướng ngại vật tầm thấp 15 phút mỗi ngày.',
    related_product_metadata: { product_category: 'agility_cones', promo_code: 'HUSKYCONE12' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Bù nước điện giải khi Husky chạy dài',
    category: 'NUTRITION',
    target_audience: {
      species: 'DOG',
      breed: 'Husky',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Chạy bộ đường dài dưới thời tiết ấm làm Husky mất nước nhanh qua tuyến mồ hôi chân và thở dốc mạnh.',
    recommended_action: 'Đem theo bình nước du lịch cầm tay, cho cún uống từng ngụm nhỏ pha chút bột bù nước điện giải.',
    related_product_metadata: { product_category: 'travel_water_bottle', promo_code: 'HUSKYWAT10' },
    base_reward_xp: 30,
    is_active: true
  },

  // ==========================================
  // 5. CHIHUAHUA (DOG)
  // ==========================================
  {
    title: 'Kiểm soát đường huyết tránh ngất cho Chihuahua',
    category: 'NUTRITION',
    target_audience: {
      species: 'DOG',
      breed: 'Chihuahua',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Gan cún nhỏ tích trữ glycogen ít, dễ bị hạ đường huyết đột ngột dẫn đến lờ đờ, co giật khi đói lâu.',
    recommended_action: 'Chia nhỏ khẩu phần ăn làm 4-5 cữ/ngày, bôi gel dinh dưỡng ngọt vào nướu cún khi thấy cún mệt mỏi.',
    related_product_metadata: { product_category: 'nutriplus_gel', promo_code: 'CHIHUGEL10' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Mặc áo ấm bảo vệ cún nhỏ Chihuahua',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'DOG',
      breed: 'Chihuahua',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Lông mỏng kết hợp thể hình siêu nhỏ làm cún tỏa nhiệt nhanh, dễ bị lạnh run và suy giảm miễn dịch.',
    recommended_action: 'Mặc áo ấm len hoặc nỉ cho cún khi thời tiết chuyển mùa lạnh dưới 20°C hoặc khi nằm phòng điều hòa.',
    related_product_metadata: { product_category: 'dog_sweater', promo_code: 'CHIHUWEAR12' },
    base_reward_xp: 20,
    is_active: true
  },
  {
    title: 'Lót thảm phòng chấn thương khớp cho Chihuahua',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'DOG',
      breed: 'Chihuahua',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Chihuahua có xương bánh chè rất dễ trượt khỏi rãnh khớp gối (Patellar Luxation) gây đau chân đi khập khiễng.',
    recommended_action: 'Lót thảm ma sát tốt ở các lối cún hay chạy, cấm cún nhảy từ các vị trí cao như giường, sofa.',
    related_product_metadata: { product_category: 'anti_slip_mat', promo_code: 'CHIHUMAT15' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Chải răng xỏ ngón tránh rụng răng ở Chihuahua',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'DOG',
      breed: 'Chihuahua',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Miệng hẹp làm các răng Chihuahua mọc chen chúc, tạo kẽ hở tích bám cao răng gây viêm chân răng rụng sớm.',
    recommended_action: 'Sử dụng bàn chải silicon xỏ ngón mềm chải răng cho cún với kem đánh răng vị thịt hằng ngày.',
    related_product_metadata: { product_category: 'finger_toothbrush', promo_code: 'CHIHUTOOTH10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Bảo vệ thóp đầu sọ mềm yếu của Chihuahua',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'DOG',
      breed: 'Chihuahua',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Nhiều bé Chihuahua có thóp đầu (Molera) không khép hết xương sọ, va đập nhẹ cũng có thể tổn thương não bộ.',
    recommended_action: 'Tránh các trò đùa giỡn thô bạo, không để cún chơi cạnh trẻ nhỏ quá hiếu động dễ làm cún ngã từ tay bế.',
    related_product_metadata: { product_category: 'soft_pet_bed', promo_code: 'CHIHUBED10' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Xã hội hóa Chihuahua giảm sủa tự vệ',
    category: 'BEHAVIOR',
    target_audience: {
      species: 'DOG',
      breed: 'Chihuahua',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Kích thước bé làm Chihuahua dễ sợ hãi người lạ, dẫn đến hành vi sủa dữ dội tự vệ quá mức.',
    recommended_action: 'Cho cún tiếp xúc nhẹ nhàng với người thân thiện từ nhỏ, thưởng cún hạt ngon khi cún im lặng trước người lạ.',
    related_product_metadata: { product_category: 'small_dog_treats', promo_code: 'CHIHUTREAT15' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Vệ sinh mắt Chihuahua ngừa bụi bám khóe',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'DOG',
      breed: 'Chihuahua',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Mắt Chihuahua to lồi dễ tiếp xúc trực tiếp bụi bẩn trong không khí, gây kích ứng tuyến lệ chảy nước mắt nhiều.',
    recommended_action: 'Nhỏ nước muối sinh lý nhỏ mắt chuyên dụng để đẩy bụi bẩn ra ngoài, lau khô vùng da mắt bằng khăn mềm.',
    related_product_metadata: { product_category: 'eye_wash_saline', promo_code: 'CHIHUEYE10' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Chọn hạt ăn cỡ mini cho Chihuahua',
    category: 'NUTRITION',
    target_audience: {
      species: 'DOG',
      breed: 'Chihuahua',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Răng và thực quản Chihuahua rất bé, hạt to làm cún khó nhai nuốt, dễ gây hóc hoặc đầy bụng khó tiêu.',
    recommended_action: 'Cho ăn dòng hạt khô hạt mini dành riêng cho giống chó siêu nhỏ (kích thước hạt dưới 8mm).',
    related_product_metadata: { product_category: 'small_breed_kibble', promo_code: 'CHIHUDOOD12' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Huấn luyện Chihuahua đi vệ sinh tã thấm',
    category: 'TRAINING',
    target_audience: {
      species: 'DOG',
      breed: 'Chihuahua',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Bàng quang Chihuahua nhỏ khó nhịn tiểu lâu, đồng thời cún rất ghét gió mưa lạnh nên lười đi vệ sinh ngoài trời.',
    recommended_action: 'Huấn luyện cún đi vệ sinh vào khay lót tã thấm đặt cố định trong nhà bằng nước xịt dẫn dụ.',
    related_product_metadata: { product_category: 'pee_pads', promo_code: 'CHIHUPEE10' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Bổ sung dưỡng chất sụn khớp gối Chihuahua',
    category: 'NUTRITION',
    target_audience: {
      species: 'DOG',
      breed: 'Chihuahua',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Xương nhỏ khớp mỏng chịu áp lực di chuyển ziczac nhanh dễ bị thoái hóa khớp bánh chè khi lớn tuổi.',
    recommended_action: 'Trộn bột bảo vệ sụn khớp dạng lỏng vào bữa ăn của cún để tăng tiết dịch nhầy bôi trơn ổ khớp gối.',
    related_product_metadata: { product_category: 'liquid_joint_supplement', promo_code: 'CHIHUJOINT15' },
    base_reward_xp: 30,
    is_active: true
  },

  // ==========================================
  // 6. BRITISH SHORTHAIR (CAT)
  // ==========================================
  {
    title: 'Cân lượng hạt ăn cho Mèo Anh lông ngắn',
    category: 'NUTRITION',
    target_audience: {
      species: 'CAT',
      breed: 'British Shorthair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Giống mèo này có bản tính lười biếng ngủ nhiều, dễ tích mỡ bụng dẫn đến tiểu đường và suy gan nhiễm mỡ.',
    recommended_action: 'Cân đúng định lượng hạt ăn mỗi ngày bằng cân tiểu ly y khoa, tránh đổ đầy bát cho mèo tự do ăn.',
    related_product_metadata: { product_category: 'food_scale', promo_code: 'BSHSCALE10' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Kích thích Mèo Anh lông ngắn vận động',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'British Shorthair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Lười vận động làm chậm trao đổi chất, tăng nguy cơ béo phì tích mỡ và lười đi tiểu gây sỏi bàng quang.',
    recommended_action: 'Dành 15 phút mỗi tối chơi cần câu lông vũ hoặc đèn laser để mèo bật nhảy chạy vận động mạnh.',
    related_product_metadata: { product_category: 'laser_pointer', promo_code: 'BSHLASER8' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Bổ sung pate ướt tăng lượng nước cho BSH',
    category: 'NUTRITION',
    target_audience: {
      species: 'CAT',
      breed: 'British Shorthair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Mèo Anh lông ngắn uống nước rất ít, có tỷ lệ cao mắc bệnh suy thận mãn và sỏi tiết niệu do nước tiểu đậm đặc.',
    recommended_action: 'Cho ăn 1 bữa pate ướt pha thêm nước ấm hằng ngày để bắt buộc mèo nạp đủ lượng nước cần thiết.',
    related_product_metadata: { product_category: 'canned_pate', promo_code: 'BSHPATE12' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Chải găng tay cao su giảm búi lông cho BSH',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'British Shorthair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Lông của mèo Aln rất dày, khi mèo tự liếm sẽ nuốt lượng lớn lông chết gây tắc ruột do búi lông.',
    recommended_action: 'Dùng găng tay chải lông cao su mềm chải vuốt khắp người mèo mỗi tuần 2-3 lần để lấy đi lông rụng.',
    related_product_metadata: { product_category: 'grooming_glove', promo_code: 'BSHGLOVE10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Tầm soát bệnh cơ tim phì đại HCM ở BSH',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'CAT',
      breed: 'British Shorthair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Mèo Anh lông ngắn mang gen đột biến dễ mắc bệnh cơ tim phì đại (HCM) gây đột tử do huyết khối bít mạch.',
    recommended_action: 'Sử dụng ống nghe y tế kiểm tra nhịp tim định kỳ lúc mèo ngủ và đưa mèo đi siêu âm tim kiểm tra vách tim.',
    related_product_metadata: { product_category: 'stethoscope_pet', promo_code: 'BSHHEART20' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Dọn khay cát cho BSH ngăn nhịn tiểu',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'British Shorthair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Mèo Aln rất sạch sẽ và nhạy mùi, khay cát bẩn khiến mèo nhịn tiểu dẫn đến viêm đường tiết niệu (FIC).',
    recommended_action: 'Xúc phân và cát vón cục trong khay ít nhất 2 lần/ngày, thay toàn bộ cát và rửa sạch khay mỗi 2 tuần.',
    related_product_metadata: { product_category: 'cat_litter', promo_code: 'BSHLIT10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Cắt móng chân tránh mọc ngược cho BSH',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'CAT',
      breed: 'British Shorthair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Móng mèo dài nhanh uốn cong, nếu lười cào mài móng sẽ đâm ngược vào đệm da chân gây nhiễm trùng mủ.',
    recommended_action: 'Dùng kìm bấm móng chuyên dụng bấm nhẹ phần đầu móng sắc của mèo mỗi 2 tuần một lần.',
    related_product_metadata: { product_category: 'cat_nail_clipper', promo_code: 'BSHCLIP10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Lắp đài phun nước tăng uống nước cho BSH',
    category: 'NUTRITION',
    target_audience: {
      species: 'CAT',
      breed: 'British Shorthair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Mèo có bản năng thích nguồn nước động luân chuyển vì cảm thấy nước sạch sẽ hơn nước tù đọng.',
    recommended_action: 'Trang bị đài phun nước tuần hoàn có bộ lọc carbon để thu hút mèo liếm nước nhiều lần trong ngày.',
    related_product_metadata: { product_category: 'water_fountain', promo_code: 'BSHFONT15' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Trang bị bàn cào móng bảo vệ đồ đạc',
    category: 'TRAINING',
    target_audience: {
      species: 'CAT',
      breed: 'British Shorthair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Cào móng giúp mèo lột lớp sừng móng chết và giải tỏa stress. Nếu không có chỗ cào mèo sẽ phá hủy sofa gỗ.',
    recommended_action: 'Đặt cột cào quấn dây thừng sisal cạnh góc ngủ của mèo, xịt chút cỏ mèo catnip để hướng dẫn cào.',
    related_product_metadata: { product_category: 'scratching_post', promo_code: 'BSHSCRATCH10' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Bổ sung L-Lysine phòng virus Herpes ở BSH',
    category: 'NUTRITION',
    target_audience: {
      species: 'CAT',
      breed: 'British Shorthair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Aln dễ mang virus đường hô hấp (FHV-1) tiềm ẩn trong cơ thể, dễ bùng phát gây viêm mũi mắt khi hệ miễn dịch suy yếu.',
    recommended_action: 'Trộn bột L-Lysine vào pate dinh dưỡng hằng ngày để hỗ trợ miễn dịch tự nhiên ngăn ngừa virus.',
    related_product_metadata: { product_category: 'lysine_powder', promo_code: 'BSHLYSINE12' },
    base_reward_xp: 30,
    is_active: true
  },

  // ==========================================
  // 7. BRITISH LONGHAIR (CAT)
  // ==========================================
  {
    title: 'Chải gỡ rối ngừa nấm da cho Mèo Anh lông dài',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'British Longhair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Lông mèo Ald siêu dài dễ rối bết giữ độ ẩm sát da, tạo môi trường thuận lợi phát triển nấm ngứa (Ringworm).',
    recommended_action: 'Dùng lược kim gỡ rối chải sâu gỡ các búi bết ở vùng nách, bẹn và quanh mông mèo mỗi ngày.',
    related_product_metadata: { product_category: 'detangling_comb', promo_code: 'BLHCOMB12' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Uống gel tiêu búi lông tránh tắc ruột cho BLH',
    category: 'NUTRITION',
    target_audience: {
      species: 'CAT',
      breed: 'British Longhair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Mèo Ald nuốt lượng lớn lông dài khi chải liếm thân, dễ tích tụ thành búi lông lớn làm tắc nghẽn ruột non.',
    recommended_action: 'Cho mèo liếm gel tiêu búi lông (hairball paste) định kỳ 2 lần mỗi tuần để bôi trơn đẩy lông theo phân ra ngoài.',
    related_product_metadata: { product_category: 'hairball_paste', promo_code: 'BLHGEL15' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Tỉa lông mông vệ sinh cho BLH tránh phân dính',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'British Longhair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Lông quanh đùi sau và hậu môn Ald dài dễ dính bám phân lỏng gây mất vệ sinh và nhiễm trùng đường tiểu.',
    recommended_action: 'Dùng kéo chuyên dụng bo góc tỉa ngắn phần lông xung quanh hậu môn của mèo (sanitary trim).',
    related_product_metadata: { product_category: 'trimming_scissors', promo_code: 'BLHSCI10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Cắt lông kẽ chân BLH tránh nấm kẽ ngón',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'CAT',
      breed: 'British Longhair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Lông kẽ chân mọc dài tích nước bẩn khi mèo dẫm khay cát ẩm, dễ gây viêm loét kẽ chân và trượt ngã.',
    recommended_action: 'Dùng tông đơ nhỏ tỉa lông kẽ ngón chân định kỳ, giữ bàn chân mèo luôn khô sạch.',
    related_product_metadata: { product_category: 'paw_wipes', promo_code: 'BLHPAW10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Tắm sấy khô lông dài chuyên biệt cho BLH',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'British Longhair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Da tiết chất nhờn bảo vệ lông dài, nếu bết lâu ngày sẽ gây viêm da dầu. Sấy không khô sẽ gây nấm da ẩm.',
    recommended_action: 'Tắm cho mèo bằng dầu tắm lông dài chuyên dụng, sấy khô tuyệt đối 100% bằng máy sấy lông thú cưng.',
    related_product_metadata: { product_category: 'long_hair_shampoo', promo_code: 'BLHSHAMP15' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Bổ sung dầu cá hồi dưỡng nang lông BLH',
    category: 'NUTRITION',
    target_audience: {
      species: 'CAT',
      breed: 'British Longhair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Thiếu hụt axit béo thiết yếu (Omega-3 và 6) làm nang lông yếu dẫn đến rụng lông xơ xác và da bong tróc vảy.',
    recommended_action: 'Cho cữ ăn tối thêm 1 giọt dầu cá hồi nguyên chất để cung cấp axit béo thiết yếu nuôi dưỡng da lông.',
    related_product_metadata: { product_category: 'salmon_oil_cat', promo_code: 'BLHOIL12' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Trồng cỏ lúa mì hỗ trợ nôn búi lông cho BLH',
    category: 'NUTRITION',
    target_audience: {
      species: 'CAT',
      breed: 'British Longhair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Chất xơ của cỏ tươi làm kích thích co bóp dạ dày, giúp mèo dễ dàng nôn ra các búi lông tích tụ lâu ngày.',
    recommended_action: 'Trồng khay cỏ mèo nhỏ tại nhà, để nơi mèo dễ tiếp cận tự ăn lá cỏ non khi cần thanh lọc dạ dày.',
    related_product_metadata: { product_category: 'cat_grass_kit', promo_code: 'BLHGRASS10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Vệ sinh tai ngừa rận tai sâu cho BLH',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'CAT',
      breed: 'British Longhair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Lông tai dài dày cản trở lưu thông khí và bám bụi bẩn, tạo tổ ấm cho rận tai ký sinh cư trú phát triển.',
    recommended_action: 'Nhỏ nước rửa tai chuyên dụng massage gốc tai ngoài 10 giây, lau sạch dịch bẩn bám loa tai.',
    related_product_metadata: { product_category: 'cat_ear_cleaner', promo_code: 'BLHEAR12' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Dùng bát nâng cao bảo vệ lông cổ BLH',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'British Longhair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Ăn bát thấp làm phần lông bờm cổ dài của Ald dính ngập vào nước ăn pate gây ẩm mốc bốc mùi.',
    recommended_action: 'Sử dụng kệ bát nâng cao có độ nghiêng nhẹ để lông cổ không chạm thức ăn nước uống khi cúi ăn.',
    related_product_metadata: { product_category: 'elevated_cat_bowl', promo_code: 'BLHBOWL10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Tầm soát đa nang thận di truyền ở BLH',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'CAT',
      breed: 'British Longhair',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Mèo Anh lông dài lai tạo từ dòng Persian có tỷ lệ cao mang gen gây bệnh thận đa nang bẩm sinh suy thận sớm.',
    recommended_action: 'Đưa mèo đi siêu âm thận tại các phòng khám y khoa để tầm soát các nang nước trong thận trước 10 tháng tuổi.',
    related_product_metadata: { product_category: 'vet_ultrasound_screening', promo_code: 'BLHCLINIC15' },
    base_reward_xp: 40,
    is_active: true
  },

  // ==========================================
  // 8. PERSIAN (CAT)
  // ==========================================
  {
    title: 'Lau sạch khóe mắt mèo Persian ngừa ố lệ',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'Persian',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Hộp sọ mặt phẳng làm ống lệ bị biến dạng uốn khúc, nước mắt tràn liên tục ra khóe gây viêm da hôi.',
    recommended_action: 'Dùng bông thấm nước rửa khóe mắt chuyên dụng lau nhẹ kẽ mắt rãnh nước mắt của mèo hằng ngày.',
    related_product_metadata: { product_category: 'tear_stain_remover', promo_code: 'PERSMAT10' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Tầm soát đa nang thận ADPKD cho mèo Persian',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'CAT',
      breed: 'Persian',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Hơn 35% giống mèo Ba Tư mang gen lỗi PKD1 gây hình thành nang nước hủy hoại mô thận gây suy thận mãn.',
    recommended_action: 'Lấy mẫu niêm mạc miệng của mèo gửi đi xét nghiệm ADN tầm soát gen PKD1 để kiểm soát chế độ chăm sóc.',
    related_product_metadata: { product_category: 'pkd_dna_test', promo_code: 'PERSDNA20' },
    base_reward_xp: 40,
    is_active: true
  },
  {
    title: 'Dùng đĩa dẹt ăn cho mèo Persian mặt tịt',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'Persian',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Hàm răng và mõm cực ngắn khiến mèo Ba Tư khó gắp hạt từ bát lòng sâu, gây sặc bẩn và khó nuốt hạt.',
    recommended_action: 'Sử dụng đĩa dẹt hoặc bát ăn nghiêng lòng nông chuyên dụng cho dòng mèo mặt tịt (flat-faced bowl).',
    related_product_metadata: { product_category: 'flat_faced_cat_bowl', promo_code: 'PERSBOWL12' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Lau kẽ gấp mũi da mõm cho Persian',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'Persian',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Nếp gấp da sâu ở giữa mắt và mũi tích tụ nước mắt sáp da bẩn tạo vi khuẩn sinh mùi viêm loét nếp gấp.',
    recommended_action: 'Dùng khăn ướt kháng khuẩn dịu nhẹ lau nhẹ nhàng kẽ da nếp gấp trên sống mũi mèo mỗi 2 ngày.',
    related_product_metadata: { product_category: 'pet_antiseptic_wipes', promo_code: 'PERSWIPE10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Hạn chế Phốt pho thức ăn cho Persian tránh hại thận',
    category: 'NUTRITION',
    target_audience: {
      species: 'CAT',
      breed: 'Persian',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Hệ thống lọc thận của Ba Tư yếu bẩm sinh, thức ăn nhiều muối phốt pho đẩy nhanh quá trình xơ hóa thận.',
    recommended_action: 'Sử dụng thức ăn có hàm lượng phốt pho thấp (dưới 0.8% chất khô) và đạm dễ hấp thụ sinh học cao.',
    related_product_metadata: { product_category: 'renal_care_cat_food', promo_code: 'PERSKIDNEY15' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Lau mụn cằm sau khi ăn pate cho Persian',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'Persian',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Mặt phẳng và cằm ngắn khiến thức ăn ướt dính vào lông cằm khi liếm ăn bít tắc lỗ chân lông tạo mụn đầu đen.',
    recommended_action: 'Dùng khăn thấm nước ấm lau sạch vùng cằm của mèo ngay sau khi mèo ăn xong pate ướt.',
    related_product_metadata: { product_category: 'acne_treatment_wipes', promo_code: 'PERSACNE10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Chống ngột ngạt khó thở cho Persian trời nóng',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'CAT',
      breed: 'Persian',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Khe mũi hẹp đường thở ngắn khiến mèo Ba Tư thải nhiệt bằng đường thở rất kém, dễ suy hô hấp khi nóng.',
    recommended_action: 'Bật máy lạnh điều hòa hoặc quạt mát giữ nhiệt độ phòng dưới 27°C khi thời tiết mùa hè oi nóng.',
    related_product_metadata: { product_category: 'cooling_fan', promo_code: 'PERSCOOL8' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Chải gỡ rối lông lót dày cho Persian',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'Persian',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Lông mèo Ba Tư siêu dài, lông lót nhiều và mịn, rất nhanh vón cục thành tảng cứng nếu không chải xơ rối.',
    recommended_action: 'Dùng lược kim răng sắt chải nhẹ từ gốc lông gỡ các búi xơ rối nhỏ hằng ngày cho mèo.',
    related_product_metadata: { product_category: 'metal_pet_comb', promo_code: 'PERSBRUSH12' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Lắp đài phun vòi nhô cao cho Persian',
    category: 'NUTRITION',
    target_audience: {
      species: 'CAT',
      breed: 'Persian',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Khi uống nước từ bát thông thường lông mặt Ba Tư bị ướt sũng bết dính nước làm mèo sợ và lười uống.',
    recommended_action: 'Sử dụng đài phun nước có vòi nhô lên dạng dòng chảy nhỏ để mèo dễ liếm nước mà không ướt lông mặt.',
    related_product_metadata: { product_category: 'raised_cat_fountain', promo_code: 'PERSFONT10' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Tầm soát tim phì đại HCM thường niên cho Persian',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'CAT',
      breed: 'Persian',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Ba Tư có nguy cơ di truyền cao bệnh cơ tim phì đại (HCM) làm vách tim dày lên cản máu đi nuôi cơ thể.',
    recommended_action: 'Đưa mèo đi chụp X-quang hoặc xét nghiệm máu đo ProBNP để kiểm tra tầm soát bệnh tim định kỳ mỗi năm.',
    related_product_metadata: { product_category: 'probnp_blood_test', promo_code: 'PERSCLINIC20' },
    base_reward_xp: 35,
    is_active: true
  },

  // ==========================================
  // 9. SCOTTISH FOLD (CAT)
  // ==========================================
  {
    title: 'Bổ sung Glucosamine bảo vệ khớp sụn Scottish Fold',
    category: 'NUTRITION',
    target_audience: {
      species: 'CAT',
      breed: 'Scottish Fold',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Đột biến gen tai cụp TRPV4 đồng thời hủy hoại sụn xương khớp (SFOCD) gây gai xương khớp đau đớn.',
    recommended_action: 'Cho mèo uống bổ sung viên nhai bảo vệ sụn khớp chứa hoạt chất Glucosamine, Chondroitin từ sớm.',
    related_product_metadata: { product_category: 'cat_joint_chews', promo_code: 'SCOTJOINT20' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Kiểm tra đốt sống đuôi phát hiện cứng khớp ở Scottish',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'CAT',
      breed: 'Scottish Fold',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Biến chứng xương khớp SFOCD gây vôi hóa làm cứng đốt sống đuôi mèo, khiến cún đau khi uốn đuôi.',
    recommended_action: 'Vuốt nắn nhẹ từ gốc đến ngọn đuôi để kiểm tra độ dẻo dai linh hoạt của đuôi mèo định kỳ mỗi tuần.',
    related_product_metadata: { product_category: 'joint_pain_relief', promo_code: 'SCOTPAIN15' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Lau sạch tai cụp gấp khúc Scottish tránh rận tai',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'CAT',
      breed: 'Scottish Fold',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Vành tai gập cụp đè kín lỗ tai cản không khí lưu thông làm tích tích sáp tai đen gây viêm tai nặng.',
    recommended_action: 'Nhỏ dung dịch vệ sinh tai massage gốc tai nhẹ loa tai ngoài gập lên lau sạch bằng tăm bông/khăn mềm.',
    related_product_metadata: { product_category: 'ear_flush_solution', promo_code: 'SCOTEAR10' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Lắp khay vệ sinh thành cực thấp cho Scottish Fold',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'Scottish Fold',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Viêm khớp làm mèo tai cụp đau khi nhảy cao hay bước qua thành khay cát cao gây thói quen đi bậy ra nhà.',
    recommended_action: 'Dùng khay cát vệ sinh có lối vào khoét thấp sát mặt đất để mèo bước vào nhẹ nhàng không phải nhảy.',
    related_product_metadata: { product_category: 'senior_cat_litter_box', promo_code: 'SCOTLIT12' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Dùng giá bát nghiêng nâng cao cho Scottish Fold',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'Scottish Fold',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Mèo cụp cổ ăn bát sát đất sẽ nén áp lực lên đĩa đệm cổ bị thoái hóa làm tăng mức độ đau xương.',
    recommended_action: 'Đặt đĩa ăn nước của mèo lên kệ nâng cao cách đất 8-10cm để mèo đứng ăn thẳng lưng cổ thoải mái.',
    related_product_metadata: { product_category: 'raised_cat_stand', promo_code: 'SCOTBOWL10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Trải thảm phòng tránh trượt ngã chân sau Scottish',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'Scottish Fold',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Sàn nhà gạch trơn láng làm chân mèo trượt khi chạy gây chấn thương bong gân dây chằng và tăng đau khớp.',
    recommended_action: 'Trải thảm cao su chống trượt tại khu vực mèo hay đi lại sinh hoạt vui chơi trong nhà.',
    related_product_metadata: { product_category: 'non_slip_rug', promo_code: 'SCOTMAT12' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Giữ cân cân đối giảm đè nén khớp Scottish',
    category: 'NUTRITION',
    target_audience: {
      species: 'CAT',
      breed: 'Scottish Fold',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Thừa cân làm tăng tải trọng áp lên các đầu khớp gối xương chân bị dị tật của Scottish Fold.',
    recommended_action: 'Định lượng thức ăn hạt hợp lý giữ mèo có thân hình thon gọn cân đối tránh béo phì tăng đau khớp.',
    related_product_metadata: { product_category: 'light_weight_cat_food', promo_code: 'SCOTFOOD15' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Tránh dùng đồ chơi câu nhảy cao cho Scottish',
    category: 'TRAINING',
    target_audience: {
      species: 'CAT',
      breed: 'Scottish Fold',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Nhảy cao từ kệ tủ xuống làm lực nện dồn khớp chân dễ gây rách rạn sụn khớp chân mèo tai cụp.',
    recommended_action: 'Chơi các trò đuổi chuột đồ chơi bò sát đất, tránh dùng đồ chơi kích thích nhảy cao quá tầm đầu.',
    related_product_metadata: { product_category: 'chase_cat_toy', promo_code: 'SCOTTOY8' },
    base_reward_xp: 35,
    is_active: true
  },
  {
    title: 'Lau lông da dưới tai cụp giữ khô thoáng',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'Scottish Fold',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Vành tai úp xuống giữ ẩm mồ hôi da tai dễ bị hăm loét da kẽ tai không nhìn thấy được từ ngoài.',
    recommended_action: 'Vệ sinh chải lông kẽ loa tai ngoài, giữ lông vùng gốc tai khô thoáng không bị ẩm ướt bết dính.',
    related_product_metadata: { product_category: 'silicon_brush', promo_code: 'SCOTBRUSH10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Nghe tim định kỳ phòng ngừa HCM ở Scottish',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'CAT',
      breed: 'Scottish Fold',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Giống mèo tai cụp có tỷ lệ cao mắc bệnh cơ tim phì đại HCM di truyền từ dòng phối cận chủng.',
    recommended_action: 'Đưa mèo đi bác sĩ nghe tim đo nhịp tim định kỳ khi đi tiêm phòng nhắc lại hằng năm.',
    related_product_metadata: { product_category: 'vet_heart_exam', promo_code: 'SCOTCLINIC15' },
    base_reward_xp: 35,
    is_active: true
  },

  // ==========================================
  // 10. SPHYNX (CAT)
  // ==========================================
  {
    title: 'Tắm rửa loại bỏ bã nhờn da mèo Sphynx',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'Sphynx',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Không có lông thấm hút bã nhờn dầu làm dầu tích tụ bết dính trên da Sphynx gây viêm da bã nhờn hôi.',
    recommended_action: 'Tắm cho mèo hằng tuần bằng sữa tắm dịu nhẹ không mùi chuyên biệt có độ pH trung tính cho da.',
    related_product_metadata: { product_category: 'oil_control_cat_shampoo', promo_code: 'SPHYNXSHAMP15' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Mặc áo giữ ấm cơ thể cho mèo Sphynx',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'Sphynx',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Không lông làm mèo Sphynx mất nhiệt tỏa nhiệt nhanh ra ngoài, rất dễ cảm lạnh viêm phổi khi trở trời.',
    recommended_action: 'Mặc áo thun cotton mềm co giãn tốt cho mèo, lót ổ nằm có đệm bông ấm áp kín gió.',
    related_product_metadata: { product_category: 'cat_clothes', promo_code: 'SPHYNXWEAR12' },
    base_reward_xp: 20,
    is_active: true
  },
  {
    title: 'Thoa kem chống nắng bảo vệ da trần Sphynx',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'CAT',
      breed: 'Sphynx',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Da Sphynx tiếp xúc trực tiếp tia cực tím ánh mặt trời gây bỏng đỏ da và tăng nguy cơ ung thư biểu mô da.',
    recommended_action: 'Thoa kem chống nắng không chứa oxit kẽm dành riêng cho mèo khi mèo nằm phơi nắng bên cửa kính gắt.',
    related_product_metadata: { product_category: 'pet_sunscreen', promo_code: 'SPHYNXSUN15' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Lau chất bùn đen kẽ móng chân cho Sphynx',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'Sphynx',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Dầu nhờn da kết hợp bụi bẩn tích bám sâu kẽ móng chân tạo lớp bùn đen hôi gây viêm quanh móng chân.',
    recommended_action: 'Dùng khăn ướt kháng khuẩn lau chùi sạch chất sáp bẩn đen ở từng kẽ ngón và gốc móng mèo tuần 2 lần.',
    related_product_metadata: { product_category: 'claw_cleaning_wipes', promo_code: 'SPHYNXCLAW10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Lau sáp tai đen loa tai to cho Sphynx',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'CAT',
      breed: 'Sphynx',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Tai Sphynx to hở không có lông ngăn cản bụi bẩn nên tai tiết lượng lớn sáp bảo vệ gây bít tắc tai.',
    recommended_action: 'Dùng tăm bông thấm nước lau tai lau nhẹ loa tai ngoài, tuyệt đối không chọc sâu ống tai trong của mèo.',
    related_product_metadata: { product_category: 'ear_wax_solvent', promo_code: 'SPHYNXEAR10' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Nhỏ nước muối rửa sạch bụi mắt Sphynx',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'CAT',
      breed: 'Sphynx',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Sphynx không có lông mi ngăn bụi, bụi không khí tiếp xúc trực tiếp giác mạc gây đỏ mắt viêm kết mạc.',
    recommended_action: 'Nhỏ nước mắt sinh lý NaCl 0.9% hoặc nước nhỏ mắt chuyên dụng rửa trôi bụi mắt cho mèo hằng ngày.',
    related_product_metadata: { product_category: 'pet_eye_drops', promo_code: 'SPHYNXEYE10' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Giặt sạch đệm ngủ quần áo mèo Sphynx',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'Sphynx',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Dầu nhờn da Sphynx tiết bám vào đệm ngủ quần áo để lâu ôi thiu tạo điều kiện vi khuẩn phát triển gây viêm da.',
    recommended_action: 'Giặt quần áo thun và vỏ đệm nằm của mèo bằng xà phòng giặt dịu nhẹ không chứa hương liệu hóa học hằng tuần.',
    related_product_metadata: { product_category: 'pet_safe_detergent', promo_code: 'SPHYNXLAUN10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Tăng lượng Calo và chất béo cho mèo Sphynx',
    category: 'NUTRITION',
    target_audience: {
      species: 'CAT',
      breed: 'Sphynx',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Để bù đắp nhiệt lượng cơ thể tỏa ra ngoài nhanh khi không có lông, mèo Sphynx có tốc độ trao đổi chất cực cao.',
    recommended_action: 'Tăng 15-20% lượng calo nạp vào bằng cách sử dụng hạt giàu protein béo chất lượng cao dễ hấp thu.',
    related_product_metadata: { product_category: 'high_calorie_cat_food', promo_code: 'SPHYNXFOOD15' },
    base_reward_xp: 30,
    is_active: true
  },
  {
    title: 'Lau sạch dầu vùng bẹn nách nếp nhăn Sphynx',
    category: 'DAILY_ROUTINE',
    target_audience: {
      species: 'CAT',
      breed: 'Sphynx',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Nếp nhăn da sâu ở nách bẹn Sphynx cọ xát tích tụ mồ hôi dầu ẩm dễ hăm loét đỏ da nổi mụn nước.',
    recommended_action: 'Dùng khăn ướt em bé không cồn lau sạch dầu nhờn ở các nếp gấp da cổ, nách, bẹn của mèo mỗi ngày.',
    related_product_metadata: { product_category: 'baby_wipes_non_scented', promo_code: 'SPHYNXWIPE10' },
    base_reward_xp: 25,
    is_active: true
  },
  {
    title: 'Siêu âm tim tầm soát HCM thường niên cho Sphynx',
    category: 'HEALTH_CARE',
    target_audience: {
      species: 'CAT',
      breed: 'Sphynx',
      age_range: { min_months: 0, max_months: 999 },
      health_condition: 'ALL'
    },
    trigger_weather: 'ALL',
    medical_fact: 'Sphynx mang tỷ lệ di truyền bệnh Cơ tim phì đại HCM rất cao gây nguy cơ suy tim tắc mạch máu đột tử.',
    recommended_action: 'Đưa mèo đi chụp siêu âm tim tại bệnh viện thú y chuyên khoa thường niên để kiểm tra độ dày thành tim.',
    related_product_metadata: { product_category: 'cat_cardiologist_visit', promo_code: 'SPHYNXTIM20' },
    base_reward_xp: 35,
    is_active: true
  }
];

async function seedKnowledge() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Successfully connected to MongoDB.');

    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of knowledgeData) {
      const existing = await VetKnowledge.findOne({
        title: item.title,
        'target_audience.breed': item.target_audience.breed
      });

      if (existing) {
        // Update existing record
        await VetKnowledge.updateOne({ _id: existing._id }, { $set: item });
        updatedCount++;
      } else {
        // Insert new record
        await VetKnowledge.create(item);
        insertedCount++;
      }
    }

    console.log(`Seeding completed. Inserted: ${insertedCount}, Updated: ${updatedCount} documents.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding VetKnowledge:', error);
    process.exit(1);
  }
}

seedKnowledge();
