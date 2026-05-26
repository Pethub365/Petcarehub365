const mongoose = require('mongoose');

const emailVerificationTokenSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token_hash: { type: String, required: true },
  expires_at: { type: Date, required: true },
}, {
  timestamps: { createdAt: 'created_at' }
});

emailVerificationTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('EmailVerificationToken', emailVerificationTokenSchema);
