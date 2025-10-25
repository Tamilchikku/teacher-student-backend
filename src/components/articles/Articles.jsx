import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articleService } from '../../pages/services/api';
import { useAuth } from '../../pages/context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import './Articles.css';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchArticles();
  }, [filters]);

  const fetchArticles = async () => {
    try {
      const response = await articleService.getAll(filters);
      setArticles(response.data.articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const categories = ['Science', 'Math', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="articles-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Articles</h1>
          <p className="page-subtitle">Explore learning materials and resources</p>
        </div>
        {user?.role === 'teacher' && (
          <Link to="/articles/create" className="btn btn-primary">
            Create Article
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search articles..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="form-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="form-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="articles-grid">
        {articles.map((article) => (
          <div key={article._id} className="article-card">
            <div className="article-header">
              <div className="article-category">{article.category}</div>
              {user?.role === 'teacher' && article.createdBy?._id === user._id && (
                <div className="article-badge">Your Article</div>
              )}
            </div>
            <h3 className="article-title">{article.title}</h3>
            <p className="article-preview">
              {article.contentBlocks?.[0]?.content?.substring(0, 150)}...
            </p>
            <div className="article-footer">
              <div className="article-meta">
                <div className="article-author">By {article.createdBy?.name}</div>
                <div className="article-date">
                  {new Date(article.createdAt).toLocaleDateString()}
                </div>
              </div>
              <Link 
                to={`/articles/${article._id}`} 
                className="btn btn-primary btn-sm"
              >
                Read
              </Link>
            </div>
          </div>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No articles found</h3>
          <p>Try adjusting your search filters or create a new article.</p>
        </div>
      )}
    </div>
  );
};

export default Articles;