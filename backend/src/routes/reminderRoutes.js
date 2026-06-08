const express = require('express');
const { body } = require('express-validator');
const {
  createReminder,
  deleteReminder,
  getReminders,
  updateReminder
} = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();
const reminderTypes = ['medicine', 'food', 'water', 'appointment', 'exercise'];

router.use(protect);

router
  .route('/')
  .post(
    [
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('type').isIn(reminderTypes).withMessage('Invalid reminder type'),
      body('date').isISO8601().withMessage('Date must be valid'),
      body('time').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Time must use HH:mm format'),
      body('recurring').optional().isBoolean().withMessage('Recurring must be boolean')
    ],
    validateRequest,
    createReminder
  )
  .get(getReminders);

router
  .route('/:id')
  .put(
    [
      body('type').optional().isIn(reminderTypes).withMessage('Invalid reminder type'),
      body('date').optional().isISO8601().withMessage('Date must be valid'),
      body('time').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Time must use HH:mm format')
    ],
    validateRequest,
    updateReminder
  )
  .delete(deleteReminder);

module.exports = router;
