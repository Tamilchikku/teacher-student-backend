const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  lastViewed: {
    type: Date,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for unique student-article combination
analyticsSchema.index({ articleId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);