const EmergencyEvent = require('../models/EmergencyEvent');
const PatientProfile = require('../models/PatientProfile');
const getAccessiblePatientId = require('../utils/patientAccess');

const getEmergencyInfo = async (req, res, next) => {
  try {
    const patientId = await getAccessiblePatientId(req.user, req.query.patientId);
    if (!patientId) return res.status(403).json({ message: 'No linked patient access' });

    const profile = await PatientProfile.findOne({ patient: patientId }).populate('caregiver', 'name phone email');
    if (!profile) return res.status(404).json({ message: 'Patient profile not found' });

    res.json({
      emergencyContacts: profile.emergencyContacts,
      caregiverPhone: profile.caregiver ? profile.caregiver.phone : undefined,
      medicalNotes: profile.medicalNotes,
      address: profile.address
    });
  } catch (error) {
    next(error);
  }
};

const shareLocation = async (req, res, next) => {
  try {
    const patientId = await getAccessiblePatientId(req.user, req.body.patientId);
    if (!patientId) return res.status(403).json({ message: 'No linked patient access' });

    const event = await EmergencyEvent.create({
      patient: patientId,
      caregiverPhone: req.body.caregiverPhone,
      hospitalContact: req.body.hospitalContact,
      notes: req.body.notes,
      location: {
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        address: req.body.address,
        sharedAt: new Date()
      }
    });

    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
};

const updateEmergencyEvent = async (req, res, next) => {
  try {
    const event = await EmergencyEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Emergency event not found' });

    const patientId = await getAccessiblePatientId(req.user, event.patient);
    if (!patientId) return res.status(403).json({ message: 'No linked patient access' });

    if (req.body.status) event.status = req.body.status;
    if (req.body.notes !== undefined) event.notes = req.body.notes;
    await event.save();

    res.json({ event });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEmergencyInfo, shareLocation, updateEmergencyEvent };
