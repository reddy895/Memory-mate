const express = require('express');
const {
  getNotifications,
  markNotificationRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markNotificationRead);

module.exports = router;
