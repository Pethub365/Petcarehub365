const mongoose = require('mongoose');

/**
 * Notification model - Thông báo cho user
 */
const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, default: 'GENERAL' }, // GENERAL, ORDER, PROMOTION, etc.
  ref_id: String, // Reference to related document
  ref_type: String, // Type of reference (Order, Product, etc.)
  is_read: { type: Boolean, default: false },
  read_at: Date,
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

notificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });

// Virtual for isRead to match frontend usage
notificationSchema.virtual('isRead').get(function () {
  return this.is_read;
});

notificationSchema.set('toObject', { virtuals: true });
notificationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);
