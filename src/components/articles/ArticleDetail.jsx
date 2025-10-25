import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articleService, trackingService, studentService } from '../../pages/services/api';
import { useAuth } from '../../pages/context/AuthContext';
import { useSocket } from '../../pages/context/SocketContext';
import LoadingSpinner from '../common/LoadingSpinner';

import toast from 'react-hot-toast';
import './ArticleDetail.css';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [newHighlight, setNewHighlight] = useState({ text: '', note: '' });
  const [loading, setLoading] = useState(true);
  const [trackingInterval, setTrackingInterval] = useState(null);
  const { user } = useAuth();
  const { emitReadingProgress, emitNewHighlight } = useSocket();

  useEffect(() => {
    fetchArticle();
    
    // Track view when article is opened
    if (user?.role === 'student') {
      trackingService.trackView(id);
    }

    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, [id]);

  useEffect(() => {
    // Start tracking reading time for students
    if (user?.role === 'student' && article) {
      const interval = setInterval(() => {
        trackingService.trackTime(id, 10); // Track 10 seconds
        emitReadingProgress(id, 10);
      }, 10000);
      
      setTrackingInterval(interval);
      
      return () => clearInterval(interval);
    }
  }, [article, user]);

  const fetchArticle = async () => {
    try {
      const [articleRes, highlightsRes] = await Promise.all([
        articleService.getById(id),
        user?.role === 'student' ? studentService.getHighlights(id) : Promise.resolve({ data: [] })
      ]);
      
      setArticle(articleRes.data);
      setHighlights(highlightsRes.data);
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Failed to load article');
      navigate('/articles');
    } finally {
      setLoading(false);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0 && user?.role === 'student') {
      setNewHighlight(prev => ({
        ...prev,
        text: selectedText
      }));
    }
  };

  const saveHighlight = async () => {
    if (!newHighlight.text.trim()) {
      toast.error('Please select some text first');
      return;
    }

    try {
      const highlightData = {
        articleId: id,
        text: newHighlight.text,
        note: newHighlight.note,
        color: '#ffeb3b'
      };

      const response = await studentService.saveHighlight(highlightData);
      setHighlights(prev => [response.data, ...prev]);
      setNewHighlight({ text: '', note: '' });
      
      emitNewHighlight(id, response.data);
      toast.success('Highlight saved!');
    } catch (error) {
      toast.error('Failed to save highlight');
    }
  };

  const deleteHighlight = async (highlightId) => {
    try {
      await studentService.deleteHighlight(highlightId);
      setHighlights(prev => prev.filter(h => h._id !== highlightId));
      toast.success('Highlight deleted');
    } catch (error) {
      toast.error('Failed to delete highlight');
    }
  };

  const markAsCompleted = async () => {
    try {
      await trackingService.markCompleted(id);
      toast.success('Article marked as completed!');
    } catch (error) {
      toast.error('Failed to mark article as completed');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!article) {
    return (
      <div className="error-state">
        <h2>Article not found</h2>
        <button onClick={() => navigate('/articles')} className="btn btn-primary">
          Back to Articles
        </button>
      </div>
    );
  }

  return (
    <div className="article-detail">
      <div className="article-header">
        <button onClick={() => navigate('/articles')} className="btn btn-secondary">
          ← Back to Articles
        </button>
        
        {user?.role === 'student' && (
          <button onClick={markAsCompleted} className="btn btn-primary">
            Mark as Completed
          </button>
        )}
      </div>

      <div className="article-content">
        <div className="content-main">
          <div className="article-meta">
            <span className="article-category">{article.category}</span>
            <span className="article-date">
              Published {new Date(article.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <h1 className="article-title">{article.title}</h1>
          <div className="article-author">By {article.createdBy?.name}</div>

          <div 
            className="content-body"
            onMouseUp={handleTextSelection}
          >
            {article.contentBlocks?.map((block, index) => (
              <div key={index} className="content-block">
                {block.type === 'text' && (
                  <p className="text-block">{block.content}</p>
                )}
                {block.type === 'image' && (
                  <div className="image-block">
                    <img src={block.content} alt={block.metadata?.alt || 'Article image'} />
                    {block.metadata?.caption && (
                      <div className="image-caption">{block.metadata.caption}</div>
                    )}
                  </div>
                )}
                {block.type === 'video' && (
                  <div className="video-block">
                    <video controls src={block.content} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Highlights Sidebar for Students */}
        {user?.role === 'student' && (
          <div className="highlights-sidebar">
            <div className="sidebar-header">
              <h3>My Highlights</h3>
            </div>

            {/* New Highlight Form */}
            {newHighlight.text && (
              <div className="new-highlight-card">
                <div className="highlight-text">"{newHighlight.text}"</div>
                <textarea
                  value={newHighlight.note}
                  onChange={(e) => setNewHighlight(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Add a note about this highlight..."
                  className="form-textarea"
                  rows="3"
                />
                <div className="highlight-actions">
                  <button onClick={saveHighlight} className="btn btn-primary btn-sm">
                    Save
                  </button>
                  <button 
                    onClick={() => setNewHighlight({ text: '', note: '' })}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Existing Highlights */}
            <div className="highlights-list">
              {highlights.map((highlight) => (
                <div key={highlight._id} className="highlight-card">
                  <div className="highlight-text">"{highlight.text}"</div>
                  {highlight.note && (
                    <div className="highlight-note">{highlight.note}</div>
                  )}
                  <div className="highlight-meta">
                    <span className="highlight-date">
                      {new Date(highlight.timestamp).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => deleteHighlight(highlight._id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {highlights.length === 0 && !newHighlight.text && (
              <div className="empty-highlights">
                <div className="empty-icon">🔖</div>
                <p>Select text to create highlights</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetail;