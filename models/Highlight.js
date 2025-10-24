const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  note: {
    type: String,
    maxlength: [500, 'Note cannot exceed 500 characters']
  },
  color: {
    type: String,
    default: '#ffeb3b'
  },
  position: {
    start: Number,
    end: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Highlight', highlightSchema);