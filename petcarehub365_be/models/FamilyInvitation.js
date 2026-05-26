const mongoose = require('mongoose');

const familyInvitationSchema = new mongoose.Schema({
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyGroup', required: true },
  invited_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invited_email: { type: String, required: true, lowercase: true, trim: true },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'], default: 'PENDING' },
  token_hash: { type: String, required: true, unique: true },
  expires_at: { type: Date, required: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

familyInvitationSchema.index({ invited_email: 1, status: 1 });
familyInvitationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // Tự dọn dẹp rác khi hết hạn

module.exports = mongoose.model('FamilyInvitation', familyInvitationSchema);
