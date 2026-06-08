const express = require('express');
const { body } = require('express-validator');
const {
  createBrainActivity,
  getBrainActivity
} = require('../controllers/brainActivityController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(
    [
      body('quizScore').isNumeric().withMessage('Quiz score is required'),
      body('completedTasks').optional().isInt({ min: 0 }).withMessage('Completed tasks must be valid'),
      body('date').optional().isISO8601().withMessage('Date must be valid')
    ],
    validateRequest,
    createBrainActivity
  )
  .get(getBrainActivity);

module.exports = router;
