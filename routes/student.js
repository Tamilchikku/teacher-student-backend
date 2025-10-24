const express = require('express');
const {
  saveHighlight,
  getHighlights,
  updateHighlight,
  deleteHighlight,
  getAllHighlights
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.route('/highlights')
  .post(saveHighlight)
  .get(getAllHighlights);

router.route('/highlights/:articleId')
  .get(getHighlights);

router.route('/highlights/:id')
  .put(updateHighlight)
  .delete(deleteHighlight);

module.exports = router;