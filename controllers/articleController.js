const Article = require('../models/Article');
const Analytics = require('../models/Analytics');

// @desc    Create article
// @route   POST /api/articles
// @access  Private/Teacher
const createArticle = async (req, res) => {
  try {
    const { title, category, contentBlocks } = req.body;

    const article = await Article.create({
      title,
      category,
      contentBlocks,
      createdBy: req.user._id
    });

    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all articles
// @route   GET /api/articles
// @access  Private
const getArticles = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    
    let query = { isPublished: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const articles = await Article.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Article.countDocuments(query);

    res.json({
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single article
// @route   GET /api/articles/:id
// @access  Private
const getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private/Teacher
const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user owns the article
    if (article.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private/Teacher
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (article.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this article' });
    }

    await Article.findByIdAndDelete(req.params.id);
    
    // Also delete related analytics and highlights
    await Analytics.deleteMany({ articleId: req.params.id });

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get teacher's articles
// @route   GET /api/articles/teacher/my-articles
// @access  Private/Teacher
const getMyArticles = async (req, res) => {
  try {
    const articles = await Article.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  getMyArticles
};