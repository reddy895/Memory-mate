const BrainActivity = require('../models/BrainActivity');
const getAccessiblePatientId = require('../utils/patientAccess');

const createBrainActivity = async (req, res, next) => {
  try {
    const patientId = await getAccessiblePatientId(req.user, req.body.patientId);
    if (!patientId) return res.status(403).json({ message: 'No linked patient access' });

    const activity = await BrainActivity.create({
      patient: patientId,
      quizScore: req.body.quizScore,
      completedTasks: req.body.completedTasks,
      date: req.body.date
    });

    res.status(201).json({ activity });
  } catch (error) {
    next(error);
  }
};

const getBrainActivity = async (req, res, next) => {
  try {
    const patientId = await getAccessiblePatientId(req.user, req.query.patientId);
    if (!patientId) return res.status(403).json({ message: 'No linked patient access' });

    const activity = await BrainActivity.find({ patient: patientId }).sort({ date: -1 });
    res.json({ activity });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBrainActivity, getBrainActivity };
