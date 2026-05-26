const mongoose = require('mongoose');

const deviceTokenSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  device_id: { type: String, required: true }, // Nhận dạng phần cứng máy (UUID)
  fcm_token: { type: String, required: true }, // Push Notification Token từ Firebase/Expo
  platform: { type: String, enum: ['IOS', 'ANDROID', 'WEB'], required: true },
  is_active: { type: Boolean, default: true },
  last_used_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Mỗi user trên 1 thiết bị chỉ có 1 token active
deviceTokenSchema.index({ user_id: 1, device_id: 1 }, { unique: true });

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);
