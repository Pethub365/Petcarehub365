const mongoose = require('mongoose');

const petMomentSchema = new mongoose.Schema({
  pet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image_url: { type: String, required: true },
  caption: { type: String, trim: true, default: '' },
  tags: [{ type: String }], // e.g., "birthday", "sleeping", "funny"
  likes_count: { type: Number, default: 0 }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

petMomentSchema.index({ pet_id: 1, created_at: -1 });

module.exports = mongoose.model('PetMoment', petMomentSchema);
