const mongoose = require('mongoose');

const dailyQuestSchema = new mongoose.Schema({
  pet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  source_knowledge_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VetKnowledge',
    required: false, // Dành để trace nguồn gốc Y khoa nếu có
  },
  assigned_date: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['DAILY_ROUTINE', 'HEALTH_CARE', 'NUTRITION', 'TRAINING']
  },
  reward_xp: {
    type: Number,
    required: true
  },
  reward_coin: {
    type: Number,
    required: true,
    default: 10
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'MISSED', 'CANCELED'],
    default: 'PENDING'
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  completed_by_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Người thao tác bấm Done (Cho chế độ Family Co-op)
    default: null
  },
  completed_at: {
    type: Date,
    default: null
  },
  valid_from_hour: {
    type: Number,
    default: null
  },
  valid_until_hour: {
    type: Number,
    default: null
  },
  // Gắn kết Affiliate Thương mại
  suggested_action: {
      has_product: { type: Boolean, default: false },
      product_query_tag: { type: String, default: null }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Đánh chỉ mục (Index) theo pet và ngày để truy vấn nhanh lúc get list cho màn home
dailyQuestSchema.index({ pet_id: 1, assigned_date: -1 });

module.exports = mongoose.model('DailyQuest', dailyQuestSchema);
