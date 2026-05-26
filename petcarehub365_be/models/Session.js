const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  is_revoked: { type: Boolean, default: false },
  expires_at: { type: Date, required: true },
  user_agent: String,
  ip_address: String,
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

sessionSchema.index({ user_id: 1 });
sessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', sessionSchema);
