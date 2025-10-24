const mongoose = require('mongoose');

const contentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image', 'video', '3d-object'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    type: Map,
    of: String
  },
  order: {
    type: Number,
    required: true
  }
});

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Science', 'Math', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Science']
  },
  contentBlocks: [contentBlockSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

articleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Article', articleSchema);
