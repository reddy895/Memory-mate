const express = require('express');
const { body } = require('express-validator');
const {
  createFamilyMemory,
  deleteFamilyMemory,
  getFamilyMemories,
  updateFamilyMemory
} = require('../controllers/familyController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('relation').trim().notEmpty().withMessage('Relation is required'),
      body('photoUrl').optional().isURL().withMessage('Photo URL must be valid')
    ],
    validateRequest,
    createFamilyMemory
  )
  .get(getFamilyMemories);

router
  .route('/:id')
  .put(
    [body('photoUrl').optional().isURL().withMessage('Photo URL must be valid')],
    validateRequest,
    updateFamilyMemory
  )
  .delete(deleteFamilyMemory);

module.exports = router;
