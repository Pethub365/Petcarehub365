const mongoose = require('mongoose');

const vaccineSchema = new mongoose.Schema({
  pet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  vaccine_name: {
    type: String,
    required: true
  },
  administered_date: {
    type: Date,
    required: true
  },
  next_due_date: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

vaccineSchema.index({ pet_id: 1, administered_date: -1 });

module.exports = mongoose.model('Vaccine', vaccineSchema);
