const express = require('express');
const {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  getMyArticles
} = require('../controllers/articleController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Specific routes MUST come before parameterized routes
router.route('/teacher/my-articles')
  .get(authorize('teacher'), getMyArticles);

router.route('/')
  .post(authorize('teacher'), createArticle)
  .get(getArticles);

// Parameterized routes come last
router.route('/:id')
  .get(getArticle)
  .put(authorize('teacher'), updateArticle)
  .delete(authorize('teacher'), deleteArticle);

module.exports = router;