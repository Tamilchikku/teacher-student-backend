const express = require('express');
const {
  getTeacherAnalytics,
  getStudentAnalytics,
  getArticleAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/teacher', authorize('teacher'), getTeacherAnalytics);
router.get('/student', authorize('student'), getStudentAnalytics);
router.get('/article/:articleId', authorize('teacher'), getArticleAnalytics);

module.exports = router;