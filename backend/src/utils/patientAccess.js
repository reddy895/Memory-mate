const PatientProfile = require('../models/PatientProfile');

const getAccessiblePatientId = async (user, requestedPatientId) => {
  if (user.role === 'patient') {
    return user._id;
  }

  if (!requestedPatientId) {
    const profile = await PatientProfile.findOne({ caregiver: user._id });
    return profile ? profile.patient : null;
  }

  const linkedProfile = await PatientProfile.findOne({
    patient: requestedPatientId,
    caregiver: user._id
  });

  return linkedProfile ? linkedProfile.patient : null;
};

module.exports = getAccessiblePatientId;
