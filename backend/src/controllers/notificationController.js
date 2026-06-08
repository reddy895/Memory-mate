const Notification = require('../models/Notification');
const getAccessiblePatientId = require('../utils/patientAccess');

const getNotifications = async (req, res, next) => {
  try {
    const patientId = await getAccessiblePatientId(req.user, req.query.patientId);
    if (!patientId) return res.status(403).json({ message: 'No linked patient access' });

    const notifications = await Notification.find({ patient: patientId })
      .populate('reminder', 'title time type')
      .sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    const patientId = await getAccessiblePatientId(req.user, notification.patient);
    if (!patientId) return res.status(403).json({ message: 'No linked patient access' });

    notification.read = true;
    await notification.save();

    res.json({ notification });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markNotificationRead };
