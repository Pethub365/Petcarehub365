const mongoose = require('mongoose');

/**
 * Role model - Manages user roles (e.g., admin, vet, store-owner, user)
 */
const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  scope: { type: String, enum: ['GLOBAL', 'STORE'], default: 'GLOBAL' },
  description: String,
  permission_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
  deleted_at: { type: Date, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Role', roleSchema);
