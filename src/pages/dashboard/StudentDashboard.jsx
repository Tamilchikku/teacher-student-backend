import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService, articleService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const StudentDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, articlesRes] = await Promise.all([
        analyticsService.getStudentAnalytics(),
        articleService.getAll({ limit: 6 })
      ]);
      
      setAnalytics(analyticsRes.data);
      setRecentArticles(articlesRes.data.articles);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const totalReadingTime = analytics?.categoryTime?.reduce((total, cat) => total + cat.totalTime, 0) || 0;

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="welcome-section student-welcome">
        <div className="welcome-content">
          <h1>Hello, {user?.name}! 🎓</h1>
          <p>Continue your learning journey and track your progress.</p>
        </div>
        <div className="welcome-stats">
          <div className="welcome-stat">
            <div className="stat-number">{analytics?.totalArticlesRead || 0}</div>
            <div className="stat-label">Articles Read</div>
          </div>
          <div className="welcome-stat">
            <div className="stat-number">{Math.round(totalReadingTime / 3600)}h</div>
            <div className="stat-label">Learning Time</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-overview">
        <h2 className="section-title">Learning Summary</h2>
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">📖</div>
            <div className="stat-content">
              <div className="stat-value">{analytics?.totalArticlesRead || 0}</div>
              <div className="stat-label">Articles Completed</div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-value">{Math.round(totalReadingTime / 3600)}h</div>
              <div className="stat-label">Total Learning Time</div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{analytics?.categoryTime?.length || 0}</div>
              <div className="stat-label">Categories Explored</div>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-value">
                {analytics?.recentActivity?.filter(act => act.completed).length || 0}
              </div>
              <div className="stat-label">Mastered Articles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Analytics */}
      <div className="charts-section">
        <div className="chart-row">
          <div className="chart-container">
            <div className="chart-header">
              <h3>Time Spent by Category</h3>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.categoryTime || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, totalTime }) => `${category}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="totalTime"
                  >
                    {(analytics?.categoryTime || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${Math.round(value / 60)}m`, 'Time']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>Articles Read per Category</h3>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.categoryTime || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="articlesCount" 
                    fill="#4f46e5" 
                    radius={[4, 4, 0, 0]}
                    name="Articles Read"
                  >
                    {(analytics?.categoryTime || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Recommended Articles */}
      <div className="content-grid">
        <div className="content-column">
          <div className="content-card">
            <div className="card-header">
              <h3>Recent Activity</h3>
              <Link to="/analytics" className="view-all-link">View Details</Link>
            </div>
            <div className="card-content">
              {analytics?.recentActivity?.slice(0, 6).map((activity) => (
                <div key={activity._id} className="list-item">
                  <div className={`activity-icon ${activity.completed ? 'completed' : 'in-progress'}`}>
                    {activity.completed ? '✓' : '📖'}
                  </div>
                  <div className="item-main">
                    <h4 className="item-title">{activity.articleId?.title}</h4>
                    <span className="item-meta">
                      {activity.articleId?.category} • {Math.round(activity.duration / 60)}m spent
                    </span>
                  </div>
                  <div className="activity-date">
                    {new Date(activity.lastViewed).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {(!analytics?.recentActivity || analytics.recentActivity.length === 0) && (
                <div className="empty-state">
                  <p>No reading activity yet</p>
                  <Link to="/articles" className="btn btn-primary btn-sm">
                    Start Reading
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="content-column">
          <div className="content-card">
            <div className="card-header">
              <h3>Recommended Articles</h3>
              <Link to="/articles" className="view-all-link">Browse All</Link>
            </div>
            <div className="card-content">
              {recentArticles.map((article) => (
                <div key={article._id} className="list-item">
                  <div className="article-category-tag">{article.category}</div>
                  <div className="item-main">
                    <h4 className="item-title">{article.title}</h4>
                    <span className="item-meta">By {article.createdBy?.name}</span>
                  </div>
                  <Link 
                    to={`/articles/${article._id}`} 
                    className="btn btn-primary btn-sm"
                  >
                    Read
                  </Link>
                </div>
              ))}
              {recentArticles.length === 0 && (
                <div className="empty-state">
                  <p>No articles available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;