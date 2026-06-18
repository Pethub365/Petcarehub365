const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    select: false
  },
  is_email_verified: {
    type: Boolean,
    default: false
  },
  auth_provider: {
    type: String,
    enum: ['LOCAL', 'GOOGLE'],
    default: 'LOCAL'
  },
  google_id: {
    type: String,
    default: null,
    sparse: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'BANNED', 'PENDING'],
    default: 'PENDING'
  },
  global_role_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  profile: {
    full_name: String,
    phone: String,
    avatar_url: String,
    gender: String,
    dob: Date,
    bio: String,
    address: String
  },
  last_login_at: Date,
  login_attempts: {
    type: Number,
    default: 0
  },
  coins: {
    type: Number,
    default: 100
  },
  is_vip: {
    type: Boolean,
    default: false
  },
  vip_expires_at: {
    type: Date,
    default: null
  },
  lock_until: Date,
  password_changed_at: Date,
  // Denormalized từ Subscription để check quyền nhanh không cần join
  subscription_plan: {
    type: String,
    enum: ['FREE', 'PREMIUM', 'VIP'],
    default: 'FREE',
  },
  subscription_expires_at: {
    type: Date,
    default: null,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

userSchema.index({ created_at: -1 });
userSchema.index({ status: 1, created_at: -1 });
userSchema.index({ username: 1 });

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

userSchema.methods.isPasswordChangedAfter = function (JWTTimestamp) {
  if (this.password_changed_at) {
    const changedTimestamp = parseInt(this.password_changed_at.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const query = { email };
  if (excludeUserId) query._id = { $ne: excludeUserId };
  const user = await this.findOne(query);
  return !!user;
};

module.exports = mongoose.model('User', userSchema);
