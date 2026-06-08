const mongoose = require('mongoose');

const emergencyEventSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    caregiverPhone: { type: String, trim: true },
    hospitalContact: { type: String, trim: true },
    location: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
      address: { type: String, trim: true },
      sharedAt: { type: Date }
    },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmergencyEvent', emergencyEventSchema);
