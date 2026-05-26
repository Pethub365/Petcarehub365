const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  // Achievement definition (static catalog)
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
    // e.g. 'FIRST_QUEST', 'WEEK_STREAK_3', 'FEED_MORNING_7', 'BATH_PET', etc.
  },
  title: {
    type: String,
    required: true
    // e.g. "Khởi đầu tốt đẹp"
  },
  description: {
    type: String,
    required: true
    // e.g. "Hoàn thành nhiệm vụ đầu tiên"
  },
  // What quest category/type unlocks this
  trigger_quest_category: {
    type: String,
    enum: ['DAILY_ROUTINE', 'HEALTH_CARE', 'NUTRITION', 'TRAINING', 'ANY'],
    default: 'ANY'
  },
  trigger_quest_title_contains: {
    type: String,
    default: null
    // substring match on quest title e.g. 'Bữa sáng'
  },
  // How many times this action must be done
  required_count: {
    type: Number,
    default: 1
  },
  // Badge icon name (Ionicons)
  badge_icon: {
    type: String,
    default: 'ribbon'
  },
  badge_color: {
    type: String,
    default: '#EC4B4B'
  },
  badge_bg_color: {
    type: String,
    default: '#FFF0F0'
  },
  // Reward for unlocking achievement
  reward_xp: {
    type: Number,
    default: 50
  },
  reward_coin: {
    type: Number,
    default: 20
  },
  // Sort order in achievements screen
  sort_order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Per-user achievement progress
const userAchievementSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievement_key: {
    type: String,
    required: true
  },
  pet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    default: null
  },
  current_count: {
    type: Number,
    default: 0
  },
  is_unlocked: {
    type: Boolean,
    default: false
  },
  unlocked_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

userAchievementSchema.index({ user_id: 1, achievement_key: 1, pet_id: 1 }, { unique: true });

const Achievement = mongoose.model('Achievement', achievementSchema);
const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);

module.exports = { Achievement, UserAchievement };
