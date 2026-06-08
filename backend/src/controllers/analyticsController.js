const BrainActivity = require('../models/BrainActivity');
const Reminder = require('../models/Reminder');
const getAccessiblePatientId = require('../utils/patientAccess');

const getAnalytics = async (req, res, next) => {
  try {
    const patientId = await getAccessiblePatientId(req.user, req.query.patientId);
    if (!patientId) return res.status(403).json({ message: 'No linked patient access' });

    const reminders = await Reminder.find({ patient: patientId });
    const medicineReminders = reminders.filter((reminder) => reminder.type === 'medicine');
    const completedMedicine = medicineReminders.filter((reminder) => reminder.completed).length;
    const medicineCompletedPercent = medicineReminders.length
      ? Math.round((completedMedicine / medicineReminders.length) * 100)
      : 0;

    const missedReminders = reminders.filter((reminder) => reminder.missed);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const weeklyReminders = reminders.filter((reminder) => new Date(reminder.date) >= weekStart);
    const weeklyBrainActivity = await BrainActivity.find({
      patient: patientId,
      date: { $gte: weekStart }
    }).sort({ date: 1 });

    res.json({
      medicineCompletedPercent,
      missedReminderCount: missedReminders.length,
      weeklyReport: {
        totalReminders: weeklyReminders.length,
        completedReminders: weeklyReminders.filter((reminder) => reminder.completed).length,
        missedReminders: weeklyReminders.filter((reminder) => reminder.missed).length,
        brainActivity: weeklyBrainActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
