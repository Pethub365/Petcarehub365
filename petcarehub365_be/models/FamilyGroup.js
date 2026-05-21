const mongoose = require('mongoose');

const familyGroupSchema = new mongoose.Schema({
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group_name: { type: String, required: true, trim: true },
  members: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['ADMIN', 'MEMBER'], default: 'MEMBER' },
    joined_at: { type: Date, default: Date.now }
  }],
  pet_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

familyGroupSchema.index({ 'members.user_id': 1 });

module.exports = mongoose.model('FamilyGroup', familyGroupSchema);
