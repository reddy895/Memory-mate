const mongoose = require('mongoose');

const familyMemorySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    photoUrl: { type: String, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    relation: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, trim: true },
    note: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FamilyMemory', familyMemorySchema);
