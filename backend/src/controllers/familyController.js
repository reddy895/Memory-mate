const FamilyMemory = require('../models/FamilyMemory');
const getAccessiblePatientId = require('../utils/patientAccess');

const createFamilyMemory = async (req, res, next) => {
  try {
    const patientId = await getAccessiblePatientId(req.user, req.body.patientId);
    if (!patientId) return res.status(403).json({ message: 'No linked patient access' });

    const family = await FamilyMemory.create({
      patient: patientId,
      photoUrl: req.body.photoUrl,
      name: req.body.name,
      relation: req.body.relation,
      phone: req.body.phone,
      note: req.body.note
    });

    res.status(201).json({ family });
  } catch (error) {
    next(error);
  }
};

const getFamilyMemories = async (req, res, next) => {
  try {
    const patientId = await getAccessiblePatientId(req.user, req.query.patientId);
    if (!patientId) return res.status(403).json({ message: 'No linked patient access' });

    const family = await FamilyMemory.find({ patient: patientId }).sort({ name: 1 });
    res.json({ family });
  } catch (error) {
    next(error);
  }
};

const updateFamilyMemory = async (req, res, next) => {
  try {
    const family = await FamilyMemory.findById(req.params.id);
    if (!family) return res.status(404).json({ message: 'Family memory not found' });

    const patientId = await getAccessiblePatientId(req.user, family.patient);
    if (!patientId) return res.status(403).json({ message: 'No linked patient access' });

    ['photoUrl', 'name', 'relation', 'phone', 'note'].forEach((field) => {
      if (req.body[field] !== undefined) family[field] = req.body[field];
    });

    await family.save();
    res.json({ family });
  } catch (error) {
    next(error);
  }
};

const deleteFamilyMemory = async (req, res, next) => {
  try {
    const family = await FamilyMemory.findById(req.params.id);
    if (!family) return res.status(404).json({ message: 'Family memory not found' });

    const patientId = await getAccessiblePatientId(req.user, family.patient);
    if (!patientId) return res.status(403).json({ message: 'No linked patient access' });

    await family.deleteOne();
    res.json({ message: 'Family memory deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFamilyMemory,
  deleteFamilyMemory,
  getFamilyMemories,
  updateFamilyMemory
};
