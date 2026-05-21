const mongoose = require('mongoose');

/**
 * UserAddress - Địa chỉ giao hàng của user (có thể nhiều địa chỉ)
 */
const userAddressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uuid: { type: String, required: true, unique: true },
  full_name: { type: String, required: true },
  phone: { type: String, required: true },
  address_line: { type: String, required: true },
  ward: String,
  district: String,
  province: String,
  country: { type: String, default: 'VN' },
  is_default: { type: Boolean, default: false },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

userAddressSchema.index({ user_id: 1 });

module.exports = mongoose.model('UserAddress', userAddressSchema);
