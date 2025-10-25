import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService, articleService } from '../../pages/services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const TeacherDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, articlesRes] = await Promise.all([
        analyticsService.getTeacherAnalytics(),
        articleService.getMyArticles()
      ]);
      
      setAnalytics(analyticsRes.data);
      setArticles(articlesRes.data);
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

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Here's what's happening with your courses today.</p>
        </div>
        <div className="welcome-actions">
          <Link to="/articles/create" className="btn btn-primary">
            Create New Article
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <h2 className="section-title">Overview</h2>
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <div className="stat-value">{analytics?.totalArticles || 0}</div>
              <div className="stat-label">Total Articles</div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{analytics?.totalStudentsRead || 0}</div>
              <div className="stat-label">Students Engaged</div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">👁️</div>
            <div className="stat-content">
              <div className="stat-value">
                {analytics?.categoryStats?.reduce((total, cat) => total + cat.totalViews, 0) || 0}
              </div>
              <div className="stat-label">Total Views</div>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-value">
                {Math.round((analytics?.categoryStats?.reduce((total, cat) => total + cat.totalDuration, 0) || 0) / 3600)}h
              </div>
              <div className="stat-label">Total Reading Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-row">
          <div className="chart-container large">
            <div className="chart-header">
              <h3>Student Engagement Trends</h3>
              <span className="chart-subtitle">Last 7 days</span>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.dailyEngagement || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="totalViews" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    activeDot={{ r: 8 }} 
                    name="Article Views"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalDuration" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Reading Time (min)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="chart-row">
          <div className="chart-container">
            <div className="chart-header">
              <h3>Category Distribution</h3>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.categoryStats || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="totalViews"
                  >
                    {(analytics?.categoryStats || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Views']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>Top Categories by Views</h3>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={analytics?.categoryStats?.slice(0, 5) || []}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="category" 
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="totalViews" 
                    fill="#4f46e5" 
                    radius={[0, 4, 4, 0]}
                    name="Views"
                  >
                    {(analytics?.categoryStats?.slice(0, 5) || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Articles & Student Progress */}
      <div className="content-grid">
        <div className="content-column">
          <div className="content-card">
            <div className="card-header">
              <h3>Recent Articles</h3>
              <Link to="/articles" className="view-all-link">View All</Link>
            </div>
            <div className="card-content">
              {articles.slice(0, 5).map((article) => (
                <div key={article._id} className="list-item">
                  <div className="item-main">
                    <h4 className="item-title">{article.title}</h4>
                    <span className="item-meta">{article.category}</span>
                  </div>
                  <div className="item-date">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {articles.length === 0 && (
                <div className="empty-state">
                  <p>No articles created yet</p>
                  <Link to="/articles/create" className="btn btn-primary btn-sm">
                    Create Your First Article
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="content-column">
          <div className="content-card">
            <div className="card-header">
              <h3>Top Students</h3>
            </div>
            <div className="card-content">
              {analytics?.studentProgress?.slice(0, 5).map((student, index) => (
                <div key={student._id} className="list-item">
                  <div className="student-rank">{index + 1}</div>
                  <div className="item-main">
                    <h4 className="item-title">{student.studentName}</h4>
                    <span className="item-meta">
                      {student.totalArticlesRead} articles • {Math.round(student.totalTimeSpent / 60)}m
                    </span>
                  </div>
                  <div className="progress-badge">
                    {Math.round(student.avgTimePerArticle / 60)}m avg
                  </div>
                </div>
              ))}
              {(!analytics?.studentProgress || analytics.studentProgress.length === 0) && (
                <div className="empty-state">
                  <p>No student data available yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;