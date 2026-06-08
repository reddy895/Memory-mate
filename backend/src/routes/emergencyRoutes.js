const express = require('express');
const { body } = require('express-validator');
const {
  getEmergencyInfo,
  shareLocation,
  updateEmergencyEvent
} = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(protect);

router.get('/', getEmergencyInfo);
router.post(
  '/share-location',
  [
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be valid'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be valid')
  ],
  validateRequest,
  shareLocation
);
router.put(
  '/:id',
  [body('status').optional().isIn(['active', 'resolved']).withMessage('Invalid emergency status')],
  validateRequest,
  updateEmergencyEvent
);

module.exports = router;
