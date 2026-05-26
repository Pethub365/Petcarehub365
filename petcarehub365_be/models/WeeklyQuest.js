const mongoose = require('mongoose');

const weeklyQuestSchema = new mongoose.Schema({
  pet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  week_start: {
    type: Date,
    required: true // Monday 00:00:00 of the week
  },
  week_end: {
    type: Date,
    required: true // Sunday 23:59:59 of the week
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
    enum: ['DAILY_ROUTINE', 'HEALTH_CARE', 'NUTRITION', 'TRAINING'],
    required: true
  },
  period: {
    type: String,
    enum: ['WEEKLY', 'MONTHLY', 'ANNUAL'],
    default: 'WEEKLY'
  },
  // For NUTRITION: meal timing
  meal_slot: {
    type: String,
    enum: ['MORNING', 'AFTERNOON', 'EVENING', null],
    default: null
  },
  // Meal cooldown: after completing, next meal unlocks after X hours
  meal_cooldown_hours: {
    type: Number,
    default: 0
  },
  last_meal_completed_at: {
    type: Date,
    default: null
  },
  reward_xp: {
    type: Number,
    required: true,
    default: 150
  },
  reward_coin: {
    type: Number,
    required: true,
    default: 30
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'MISSED'],
    default: 'PENDING'
  },
  completed_by_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  completed_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

weeklyQuestSchema.index({ pet_id: 1, week_start: -1 });
weeklyQuestSchema.index({ pet_id: 1, period: 1, week_start: -1 });

module.exports = mongoose.model('WeeklyQuest', weeklyQuestSchema);
