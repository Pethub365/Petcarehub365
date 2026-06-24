const mongoose = require('mongoose');

/**
 * Feedback model - Đánh giá phản hồi của người dùng
 */
const feedbackSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

feedbackSchema.index({ rating: -1, created_at: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
