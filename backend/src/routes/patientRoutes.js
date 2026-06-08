const express = require('express');
const { body } = require('express-validator');
const { getProfile, updateProfile } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put(
  '/profile',
  [
    body('language').optional().isIn(['en', 'kn']).withMessage('Language must be en or kn'),
    body('fontSize').optional().isIn(['normal', 'large', 'xlarge']).withMessage('Invalid font size'),
    body('voiceVolume').optional().isIn(['muted', 'soft', 'normal', 'loud']).withMessage('Invalid voice volume'),
    body('age').optional().isInt({ min: 0, max: 130 }).withMessage('Age must be valid'),
    body('emergencyContacts').optional().isArray().withMessage('Emergency contacts must be an array'),
    body('caregiverEmail').optional().isEmail().withMessage('Caregiver email must be valid')
  ],
  validateRequest,
  updateProfile
);

module.exports = router;
