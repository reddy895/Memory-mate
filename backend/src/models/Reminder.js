const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    type: {
      type: String,
      enum: ['medicine', 'food', 'water', 'appointment', 'exercise'],
      required: true
    },
    date: { type: Date, required: true },
    time: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/
    },
    recurring: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    missed: { type: Boolean, default: false },
    completedAt: { type: Date },
    missedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);
