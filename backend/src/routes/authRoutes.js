const express = require('express');
const { body } = require('express-validator');
const { login, me, signup } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['patient', 'caregiver']).withMessage('Role must be patient or caregiver'),
    body('language').optional().isIn(['en', 'kn']).withMessage('Language must be en or kn'),
    body('fontSize').optional().isIn(['normal', 'large', 'xlarge']).withMessage('Invalid font size'),
    body('voiceVolume').optional().isIn(['muted', 'soft', 'normal', 'loud']).withMessage('Invalid voice volume'),
    body('age').optional().isInt({ min: 0, max: 130 }).withMessage('Age must be valid')
  ],
  validateRequest,
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateRequest,
  login
);

router.get('/me', protect, me);

module.exports = router;
