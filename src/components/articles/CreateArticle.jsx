import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { articleService } from '../../pages/services/api';
import { useAuth } from '../../pages/context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import './CreateArticle.css';

const CreateArticle = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Science',
    contentBlocks: [
      {
        type: 'text',
        content: '',
        order: 1
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = ['Science', 'Math', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentBlockChange = (index, field, value) => {
    const updatedBlocks = [...formData.contentBlocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      contentBlocks: updatedBlocks
    }));
  };

  const addContentBlock = () => {
    setFormData(prev => ({
      ...prev,
      contentBlocks: [
        ...prev.contentBlocks,
        {
          type: 'text',
          content: '',
          order: prev.contentBlocks.length + 1
        }
      ]
    }));
  };

  const removeContentBlock = (index) => {
    if (formData.contentBlocks.length > 1) {
      const updatedBlocks = formData.contentBlocks.filter((_, i) => i !== index);
      // Reorder blocks
      const reorderedBlocks = updatedBlocks.map((block, i) => ({
        ...block,
        order: i + 1
      }));
      
      setFormData(prev => ({
        ...prev,
        contentBlocks: reorderedBlocks
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.contentBlocks[0].content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      await articleService.create(formData);
      toast.success('Article created successfully!');
      navigate('/articles');
    } catch (error) {
      console.error('Error creating article:', error);
      toast.error(error.response?.data?.message || 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-article">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Create New Article</h1>
          <p className="page-subtitle">Share knowledge with your students</p>
        </div>
        <button 
          onClick={() => navigate('/articles')} 
          className="btn btn-secondary"
        >
          Back to Articles
        </button>
      </div>

      <form onSubmit={handleSubmit} className="article-form">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Article Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter article title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Content Blocks</h3>
            <button 
              type="button" 
              onClick={addContentBlock}
              className="btn btn-primary btn-sm"
            >
              + Add Block
            </button>
          </div>

          {formData.contentBlocks.map((block, index) => (
            <div key={index} className="content-block-editor">
              <div className="block-header">
                <div className="block-number">Block {index + 1}</div>
                <div className="block-controls">
                  <select
                    value={block.type}
                    onChange={(e) => handleContentBlockChange(index, 'type', e.target.value)}
                    className="form-select block-type-select"
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="3d-object">3D Object</option>
                  </select>
                  
                  {formData.contentBlocks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContentBlock(index)}
                      className="btn btn-danger btn-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="block-content">
                {block.type === 'text' && (
                  <textarea
                    value={block.content}
                    onChange={(e) => handleContentBlockChange(index, 'content', e.target.value)}
                    className="form-textarea"
                    placeholder="Enter your content here..."
                    rows="6"
                    required
                  />
                )}
                
                {block.type === 'image' && (
                  <div className="media-input">
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleContentBlockChange(index, 'content', e.target.value)}
                      className="form-input"
                      placeholder="Enter image URL"
                    />
                    <small className="input-help">
                      Enter the URL of the image you want to include
                    </small>
                  </div>
                )}
                
                {block.type === 'video' && (
                  <div className="media-input">
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleContentBlockChange(index, 'content', e.target.value)}
                      className="form-input"
                      placeholder="Enter video URL"
                    />
                    <small className="input-help">
                      Enter the URL of the video you want to include
                    </small>
                  </div>
                )}
                
                {block.type === '3d-object' && (
                  <div className="media-input">
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleContentBlockChange(index, 'content', e.target.value)}
                      className="form-input"
                      placeholder="Enter 3D object URL or identifier"
                    />
                    <small className="input-help">
                      Enter the URL or identifier for the 3D object
                    </small>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/articles')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" /> : 'Create Article'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateArticle;