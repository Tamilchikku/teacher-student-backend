import React, { useState, useEffect } from 'react';
import { analyticsService, articleService } from '../../pages/services/api';
import { useAuth } from '../../pages/context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleAnalytics, setArticleAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    if (selectedArticle) {
      fetchArticleAnalytics(selectedArticle);
    }
  }, [selectedArticle]);

  const fetchAnalyticsData = async () => {
    try {
      let analyticsRes;
      let articlesRes;

      if (user.role === 'teacher') {
        [analyticsRes, articlesRes] = await Promise.all([
          analyticsService.getTeacherAnalytics(),
          articleService.getMyArticles()
        ]);
      } else {
        analyticsRes = await analyticsService.getStudentAnalytics();
        articlesRes = { data: { articles: [] } };
      }
      
      setAnalytics(analyticsRes.data);
      setArticles(articlesRes.data.articles || articlesRes.data);
      
      if (articlesRes.data.articles?.length > 0) {
        setSelectedArticle(articlesRes.data.articles[0]._id);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleAnalytics = async (articleId) => {
    if (user.role !== 'teacher') return;

    try {
      const response = await analyticsService.getArticleAnalytics(articleId);
      setArticleAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching article analytics:', error);
    }
  };

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1 className="page-title">
          {user.role === 'teacher' ? 'Teaching Analytics' : 'My Learning Progress'}
        </h1>
        <p className="page-subtitle">
          {user.role === 'teacher' 
            ? 'Track student engagement and article performance' 
            : 'Monitor your reading progress and learning patterns'
          }
        </p>
      </div>

      {user.role === 'teacher' ? (
        <div className="teacher-analytics">
          {/* Article Selector */}
          <div className="section">
            <div className="section-header">
              <h2>Article Performance</h2>
            </div>
            <div className="article-selector">
              <select
                value={selectedArticle || ''}
                onChange={(e) => setSelectedArticle(e.target.value)}
                className="form-select"
              >
                <option value="">Select an article</option>
                {articles.map(article => (
                  <option key={article._id} value={article._id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </div>

            {articleAnalytics && (
              <div className="article-stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{articleAnalytics.summary.totalViews}</div>
                  <div className="stat-label">Total Views</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{articleAnalytics.summary.uniqueReaders}</div>
                  <div className="stat-label">Unique Readers</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {Math.round(articleAnalytics.summary.totalTime / 60)}m
                  </div>
                  <div className="stat-label">Total Reading Time</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {Math.round(articleAnalytics.summary.avgTimePerReader / 60)}m
                  </div>
                  <div className="stat-label">Avg. Time per Reader</div>
                </div>
              </div>
            )}
          </div>

          {/* Reader Details Table */}
          {articleAnalytics && (
            <div className="section">
              <div className="section-header">
                <h2>Reader Details</h2>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Views</th>
                      <th>Time Spent</th>
                      <th>Last Viewed</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articleAnalytics.readerDetails.map((reader) => (
                      <tr key={reader._id}>
                        <td>{reader.studentId?.name}</td>
                        <td>{reader.views}</td>
                        <td>{Math.round(reader.duration / 60)}m</td>
                        <td>{new Date(reader.lastViewed).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${reader.completed ? 'badge-success' : 'badge-warning'}`}>
                            {reader.completed ? 'Completed' : 'In Progress'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Category Performance */}
          <div className="section">
            <div className="section-header">
              <h2>Category Performance</h2>
            </div>
            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Views by Category</h3>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.categoryStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalViews" fill="#4f46e5" name="Total Views" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>Reading Time by Category</h3>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.categoryStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${Math.round(value / 60)}m`, 'Time']} />
                      <Legend />
                      <Bar dataKey="totalDuration" fill="#10b981" name="Reading Time" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="student-analytics">
          {/* Student Progress Charts */}
          <div className="section">
            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Reading Distribution</h3>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics?.categoryTime || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, articlesCount }) => `${category}: ${articlesCount}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="articlesCount"
                      >
                        {(analytics?.categoryTime || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>Time Spent by Category</h3>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.categoryTime || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${Math.round(value / 60)}m`, 'Time']} />
                      <Legend />
                      <Bar dataKey="totalTime" fill="#8b5cf6" name="Time Spent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="section">
            <div className="section-header">
              <h2>Reading History</h2>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Category</th>
                    <th>Last Read</th>
                    <th>Time Spent</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.recentActivity?.map((activity) => (
                    <tr key={activity._id}>
                      <td>{activity.articleId?.title}</td>
                      <td>
                        <span className="badge badge-primary">{activity.articleId?.category}</span>
                      </td>
                      <td>{new Date(activity.lastViewed).toLocaleDateString()}</td>
                      <td>{Math.round(activity.duration / 60)}m</td>
                      <td>
                        <span className={`badge ${activity.completed ? 'badge-success' : 'badge-warning'}`}>
                          {activity.completed ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;