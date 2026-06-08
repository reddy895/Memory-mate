const mongoose = require('mongoose');

const brainActivitySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    quizScore: { type: Number, required: true, min: 0 },
    completedTasks: { type: Number, default: 0, min: 0 },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('BrainActivity', brainActivitySchema);
