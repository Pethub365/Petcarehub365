const mongoose = require('mongoose');

const vetKnowledgeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    description: "Tiêu đề của bài tri thức (VD: Chăm sóc Poodle mùa nồm)"
  },
  category: {
    type: String,
    enum: ['DAILY_ROUTINE', 'HEALTH_CARE', 'NUTRITION', 'TRAINING', 'BEHAVIOR'],
    required: true
  },
  target_audience: {
    species: { type: String, enum: ['DOG', 'CAT', 'ALL'], default: 'ALL' },
    breed: { type: String, default: 'ALL' }, // Giống loài. VD: Poodle
    age_range: { 
        min_months: { type: Number, default: 0 },
        max_months: { type: Number, default: 999 }
    },
    health_condition: { type: String, default: 'ALL' } // Lọc theo thể trạng. VD: OVERWEIGHT
  },
  trigger_weather: {
      type: String,
      enum: ['RAIN', 'SUNNY', 'COLD', 'ALL'],
      default: 'ALL'
  },
  medical_fact: {
    type: String,
    required: true,
    description: "Lý thuyết y khoa gốc (VD: Độ ẩm cao dễ gây viêm da kẽ chân ở chó lông xoăn)"
  },
  recommended_action: {
    type: String,
    required: true,
    description: "Câu kêu gọi hành động cho User (VD: Dùng lược chuyên dụng chải kẽ chân và sấy khô 10 phút)"
  },
  related_product_metadata: {
    product_category: String, // Khóa dùng để truy vấn món đồ tương đương (VD: "dog_comb")
    promo_code: String        // (Optional) Mã giảm giá đính kèm
  },
  base_reward_xp: {
    type: Number,
    default: 20
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Đánh Index cho Vector/RAG query nhanh
vetKnowledgeSchema.index({ "target_audience.species": 1, "category": 1 });

module.exports = mongoose.model('VetKnowledge', vetKnowledgeSchema);
