const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    caregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reminder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reminder'
    },
    type: {
      type: String,
      enum: ['reminder_alert', 'missed_reminder_alert'],
      required: true
    },
    message: { type: String, required: true, trim: true },
    sentToCaregiver: { type: Boolean, default: false },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
