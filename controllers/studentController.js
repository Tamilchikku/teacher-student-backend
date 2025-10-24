const Highlight = require('../models/Highlight');
const Analytics = require('../models/Analytics');

// @desc    Save student highlight
// @route   POST /api/student/highlights
// @access  Private/Student
const saveHighlight = async (req, res) => {
  try {
    const { articleId, text, note, color, position } = req.body;

    const highlight = await Highlight.create({
      studentId: req.user._id,
      articleId,
      text,
      note,
      color,
      position
    });

    await highlight.populate('articleId', 'title');

    res.status(201).json(highlight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student's highlights for an article
// @route   GET /api/student/highlights/:articleId
// @access  Private/Student
const getHighlights = async (req, res) => {
  try {
    const { articleId } = req.params;

    const highlights = await Highlight.find({
      studentId: req.user._id,
      articleId
    }).sort({ timestamp: -1 });

    res.json(highlights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update highlight
// @route   PUT /api/student/highlights/:id
// @access  Private/Student
const updateHighlight = async (req, res) => {
  try {
    const { note, color } = req.body;

    const highlight = await Highlight.findById(req.params.id);

    if (!highlight) {
      return res.status(404).json({ message: 'Highlight not found' });
    }

    if (highlight.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    highlight.note = note || highlight.note;
    highlight.color = color || highlight.color;
    
    const updatedHighlight = await highlight.save();

    res.json(updatedHighlight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete highlight
// @route   DELETE /api/student/highlights/:id
// @access  Private/Student
const deleteHighlight = async (req, res) => {
  try {
    const highlight = await Highlight.findById(req.params.id);

    if (!highlight) {
      return res.status(404).json({ message: 'Highlight not found' });
    }

    if (highlight.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Highlight.findByIdAndDelete(req.params.id);

    res.json({ message: 'Highlight deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student's all highlights
// @route   GET /api/student/highlights
// @access  Private/Student
const getAllHighlights = async (req, res) => {
  try {
    const highlights = await Highlight.find({ studentId: req.user._id })
      .populate('articleId', 'title category')
      .sort({ timestamp: -1 });

    res.json(highlights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  saveHighlight,
  getHighlights,
  updateHighlight,
  deleteHighlight,
  getAllHighlights
};