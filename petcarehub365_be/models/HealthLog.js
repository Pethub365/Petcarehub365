const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema({
  pet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  weight: {
    type: Number,
    required: true // kg
  },
  height: {
    type: Number,
    required: false,
    default: null // cm
  },
  heart_rate: {
    type: Number,
    default: null // bpm
  },
  temperature: {
    type: Number,
    default: null // °C
  },
  health_status: {
    type: String,
    enum: ['NORMAL', 'OVERWEIGHT', 'UNDERWEIGHT', 'SICK', 'POST_SURGERY'],
    default: 'NORMAL'
  },
  note: {
    type: String,
    default: ''
  },
  food_intake: {
    type: Number,
    default: null // grams
  },
  water_intake: {
    type: Number,
    default: null // ml
  },
  sleep_duration: {
    type: Number,
    default: null // hours
  },
  activity_minutes: {
    type: Number,
    default: null // minutes
  },
  measured_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

healthLogSchema.index({ pet_id: 1, measured_at: 1 });

module.exports = mongoose.model('HealthLog', healthLogSchema);
