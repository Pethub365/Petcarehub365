const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: String, // DOG, CAT
    required: true,
    enum: ['DOG', 'CAT', 'OTHER']
  },
  breed: {
    type: String, // Poodle, Corgi, ALN...
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  weight: {
    type: Number, // Theo KG
    default: null
  },
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'UNKNOWN'],
    default: 'UNKNOWN'
  },
  is_neutered: {
    type: Boolean, // Triệt sản hay chưa
    default: false
  },
  health_status: {
    type: String,
    enum: ['NORMAL', 'OVERWEIGHT', 'UNDERWEIGHT', 'SICK', 'POST_SURGERY'],
    default: 'NORMAL'
  },
  avatar_url: {
    type: String,
    default: null
  },
  // Các chỉ số Gamification
  stats: {
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    mood: { type: Number, min: 0, max: 100, default: 100 },      // Thể hiện độ vui vẻ (Mood Bar)
    energy: { type: Number, min: 0, max: 100, default: 100 },     // Năng lượng mỗi ngày
    last_decay_time: { type: Date, default: Date.now }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

petSchema.index({ owner_id: 1 });
petSchema.index({ 'stats.xp': -1 }); // Tối ưu truy vấn bảng xếp hạng

module.exports = mongoose.model('Pet', petSchema);
