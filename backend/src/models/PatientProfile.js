const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    relation: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    priority: { type: Number, default: 1, min: 1 }
  },
  { _id: true }
);

const patientProfileSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 0, max: 130 },
    language: { type: String, enum: ['en', 'kn'], default: 'en' },
    fontSize: { type: String, enum: ['normal', 'large', 'xlarge'], default: 'large' },
    voiceVolume: { type: String, enum: ['muted', 'soft', 'normal', 'loud'], default: 'normal' },
    address: { type: String, trim: true },
    caregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emergencyContacts: [emergencyContactSchema],
    medicalNotes: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
