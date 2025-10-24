const express = require('express');
const {
  trackView,
  trackTime,
  markCompleted
} = require('../controllers/trackingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.post('/view', trackView);
router.post('/time', trackTime);
router.post('/complete', markCompleted);

module.exports = router;