const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');
const PatientProfile = require('../models/PatientProfile');
const getAccessiblePatientId = require('../utils/patientAccess');

const createReminder = async (req, res, next) => {
  try {
    const patientId = await getAccessiblePatientId(req.user, req.body.patientId);
    if (!patientId) return res.status(403).json({ message: 'No linked patient access' });

    const reminder = await Reminder.create({
      patient: patientId,
      title: req.body.title,
      type: req.body.type,
      date: req.body.date,
      time: req.body.time,
      recurring: req.body.recurring,
      completed: req.body.completed,
      missed: req.body.missed
    });

    await Notification.create({
      patient: patientId,
      reminder: reminder._id,
      type: 'reminder_alert',
      message: `Reminder scheduled: ${reminder.title} at ${reminder.time}`
    });

    res.status(201).json({ reminder });
  } catch (error) {
    next(error);
  }
};

const getReminders = async (req, res, next) => {
  try {
    const patientId = await getAccessiblePatientId(req.user, req.query.patientId);
    if (!patientId) return res.status(403).json({ message: 'No linked patient access' });

    const filter = { patient: patientId };
    if (req.query.completed !== undefined) filter.completed = req.query.completed === 'true';
    if (req.query.missed !== undefined) filter.missed = req.query.missed === 'true';
    if (req.query.type) filter.type = req.query.type;

    const reminders = await Reminder.find(filter).sort({ date: 1, time: 1 });
    res.json({ reminders });
  } catch (error) {
    next(error);
  }
};

const updateReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });

    const patientId = await getAccessiblePatientId(req.user, reminder.patient);
    if (!patientId) return res.status(403).json({ message: 'No linked patient access' });

    const wasMissed = reminder.missed;
    const allowed = ['title', 'type', 'date', 'time', 'recurring', 'completed', 'missed'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) reminder[field] = req.body[field];
    });

    if (req.body.completed === true) {
      reminder.completedAt = new Date();
      reminder.missed = false;
      reminder.missedAt = undefined;
    }

    if (req.body.missed === true) {
      reminder.missedAt = new Date();
      reminder.completed = false;
      reminder.completedAt = undefined;
    }

    await reminder.save();

    if (!wasMissed && reminder.missed) {
      const profile = await PatientProfile.findOne({ patient: reminder.patient });
      await Notification.create({
        patient: reminder.patient,
        caregiver: profile ? profile.caregiver : undefined,
        reminder: reminder._id,
        type: 'missed_reminder_alert',
        message: `Missed reminder: ${reminder.title}`,
        sentToCaregiver: Boolean(profile && profile.caregiver)
      });
    }

    res.json({ reminder });
  } catch (error) {
    next(error);
  }
};

const deleteReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });

    const patientId = await getAccessiblePatientId(req.user, reminder.patient);
    if (!patientId) return res.status(403).json({ message: 'No linked patient access' });

    await reminder.deleteOne();
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReminder, deleteReminder, getReminders, updateReminder };
