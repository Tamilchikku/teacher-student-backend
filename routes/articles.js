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

router.route('/')
  .post(authorize('teacher'), createArticle)
  .get(getArticles);

router.route('/teacher/my-articles')
  .get(authorize('teacher'), getMyArticles);

router.route('/:id')
  .get(getArticle)
  .put(authorize('teacher'), updateArticle)
  .delete(authorize('teacher'), deleteArticle);

module.exports = router;