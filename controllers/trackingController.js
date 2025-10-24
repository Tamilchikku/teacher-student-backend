const Analytics = require('../models/Analytics');

// @desc    Track article view
// @route   POST /api/tracking/view
// @access  Private/Student
const trackView = async (req, res) => {
  try {
    const { articleId } = req.body;

    let analytics = await Analytics.findOne({
      articleId,
      studentId: req.user._id
    });

    if (analytics) {
      analytics.views += 1;
      analytics.lastViewed = new Date();
    } else {
      analytics = new Analytics({
        articleId,
        studentId: req.user._id,
        views: 1
      });
    }

    await analytics.save();
    
    // Emit real-time update via socket
    req.io.emit('articleViewed', {
      articleId,
      studentId: req.user._id,
      views: analytics.views
    });

    res.json({ message: 'View tracked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track reading time
// @route   POST /api/tracking/time
// @access  Private/Student
const trackTime = async (req, res) => {
  try {
    const { articleId, timeSpent } = req.body;

    let analytics = await Analytics.findOne({
      articleId,
      studentId: req.user._id
    });

    if (analytics) {
      analytics.duration += timeSpent;
      analytics.lastViewed = new Date();
      
      // Mark as completed if duration exceeds 5 minutes
      if (analytics.duration > 300) {
        analytics.completed = true;
      }
    } else {
      analytics = new Analytics({
        articleId,
        studentId: req.user._id,
        duration: timeSpent,
        views: 1
      });
    }

    await analytics.save();

    res.json({ message: 'Time tracked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark article as completed
// @route   POST /api/tracking/complete
// @access  Private/Student
const markCompleted = async (req, res) => {
  try {
    const { articleId } = req.body;

    await Analytics.findOneAndUpdate(
      { articleId, studentId: req.user._id },
      { completed: true, lastViewed: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: 'Article marked as completed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  trackView,
  trackTime,
  markCompleted
};