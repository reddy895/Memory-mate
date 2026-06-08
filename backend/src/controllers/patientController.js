const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const getAccessiblePatientId = require('../utils/patientAccess');

const getProfile = async (req, res, next) => {
  try {
    const patientId = await getAccessiblePatientId(req.user, req.query.patientId);

    if (!patientId) {
      return res.status(403).json({ message: 'No linked patient profile found' });
    }

    const profile = await PatientProfile.findOne({ patient: patientId })
      .populate('patient', 'name email role phone')
      .populate('caregiver', 'name email role phone');

    if (!profile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const patientId = await getAccessiblePatientId(req.user, req.query.patientId);

    if (!patientId) {
      return res.status(403).json({ message: 'No linked patient profile found' });
    }

    const updates = {
      name: req.body.name,
      age: req.body.age,
      language: req.body.language,
      fontSize: req.body.fontSize,
      voiceVolume: req.body.voiceVolume,
      address: req.body.address,
      emergencyContacts: req.body.emergencyContacts,
      medicalNotes: req.body.medicalNotes
    };

    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

    if (req.body.caregiverEmail) {
      const caregiver = await User.findOne({ email: req.body.caregiverEmail, role: 'caregiver' });
      if (!caregiver) {
        return res.status(404).json({ message: 'Caregiver account not found' });
      }
      updates.caregiver = caregiver._id;
    }

    const profile = await PatientProfile.findOneAndUpdate(
      { patient: patientId },
      updates,
      { new: true, runValidators: true }
    ).populate('caregiver', 'name email role phone');

    if (!profile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };
