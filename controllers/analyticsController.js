const Analytics = require('../models/Analytics');
const Article = require('../models/Article');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get teacher dashboard analytics
// @route   GET /api/analytics/teacher
// @access  Private/Teacher
const getTeacherAnalytics = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Total articles created
    const totalArticles = await Article.countDocuments({ createdBy: teacherId });

    // Total students who read teacher's articles
    const totalStudentsRead = await Analytics.distinct('studentId', {
      articleId: { 
        $in: await Article.find({ createdBy: teacherId }).distinct('_id') 
      }
    });

    // Most viewed categories
    const categoryStats = await Analytics.aggregate([
      {
        $lookup: {
          from: 'articles',
          localField: 'articleId',
          foreignField: '_id',
          as: 'article'
        }
      },
      { $unwind: '$article' },
      { $match: { 'article.createdBy': new mongoose.Types.ObjectId(teacherId) } },
      {
        $group: {
          _id: '$article.category',
          totalViews: { $sum: '$views' },
          totalDuration: { $sum: '$duration' },
          articleCount: { $addToSet: '$articleId' }
        }
      },
      {
        $project: {
          category: '$_id',
          totalViews: 1,
          totalDuration: 1,
          articleCount: { $size: '$articleCount' }
        }
      },
      { $sort: { totalViews: -1 } }
    ]);

    // Daily engagement trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyEngagement = await Analytics.aggregate([
      {
        $lookup: {
          from: 'articles',
          localField: 'articleId',
          foreignField: '_id',
          as: 'article'
        }
      },
      { $unwind: '$article' },
      { 
        $match: { 
          'article.createdBy': new mongoose.Types.ObjectId(teacherId),
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalViews: { $sum: '$views' },
          totalDuration: { $sum: '$duration' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Student-wise reading progress
    const studentProgress = await Analytics.aggregate([
      {
        $lookup: {
          from: 'articles',
          localField: 'articleId',
          foreignField: '_id',
          as: 'article'
        }
      },
      { $unwind: '$article' },
      { $match: { 'article.createdBy': new mongoose.Types.ObjectId(teacherId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$studentId',
          studentName: { $first: '$student.name' },
          totalArticlesRead: { $sum: 1 },
          totalTimeSpent: { $sum: '$duration' },
          avgTimePerArticle: { $avg: '$duration' }
        }
      },
      { $sort: { totalTimeSpent: -1 } }
    ]);

    res.json({
      totalArticles,
      totalStudentsRead: totalStudentsRead.length,
      categoryStats,
      dailyEngagement,
      studentProgress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student dashboard analytics
// @route   GET /api/analytics/student
// @access  Private/Student
const getStudentAnalytics = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Total articles read
    const totalArticlesRead = await Analytics.countDocuments({ 
      studentId, 
      views: { $gt: 0 } 
    });

    // Reading time per category
    const categoryTime = await Analytics.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $lookup: {
          from: 'articles',
          localField: 'articleId',
          foreignField: '_id',
          as: 'article'
        }
      },
      { $unwind: '$article' },
      {
        $group: {
          _id: '$article.category',
          totalTime: { $sum: '$duration' },
          articlesRead: { $addToSet: '$articleId' }
        }
      },
      {
        $project: {
          category: '$_id',
          totalTime: 1,
          articlesCount: { $size: '$articlesRead' }
        }
      }
    ]);

    // Recent reading activity
    const recentActivity = await Analytics.find({ studentId })
      .populate('articleId', 'title category')
      .sort({ lastViewed: -1 })
      .limit(10);

    res.json({
      totalArticlesRead,
      categoryTime,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get article-specific analytics
// @route   GET /api/analytics/article/:articleId
// @access  Private/Teacher
const getArticleAnalytics = async (req, res) => {
  try {
    const { articleId } = req.params;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if teacher owns the article
    if (article.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const analytics = await Analytics.find({ articleId })
      .populate('studentId', 'name email')
      .sort({ lastViewed: -1 });

    const totalViews = analytics.reduce((sum, item) => sum + item.views, 0);
    const totalTime = analytics.reduce((sum, item) => sum + item.duration, 0);
    const uniqueReaders = analytics.length;

    res.json({
      article: {
        title: article.title,
        category: article.category
      },
      summary: {
        totalViews,
        totalTime,
        uniqueReaders,
        avgTimePerReader: uniqueReaders > 0 ? totalTime / uniqueReaders : 0
      },
      readerDetails: analytics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTeacherAnalytics,
  getStudentAnalytics,
  getArticleAnalytics
};