import axios from 'axios';

// Use environment variable with fallback for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Article APIs
export const articleService = {
  create: (articleData) => api.post('/articles', articleData),
  getAll: (params = {}) => api.get('/articles', { params }),
  getById: (id) => api.get(`/articles/${id}`),
  update: (id, articleData) => api.put(`/articles/${id}`, articleData),
  delete: (id) => api.delete(`/articles/${id}`),
  getMyArticles: () => api.get('/articles/teacher/my-articles'),
};

// Analytics APIs
export const analyticsService = {
  getTeacherAnalytics: () => api.get('/analytics/teacher'),
  getStudentAnalytics: () => api.get('/analytics/student'),
  getArticleAnalytics: (articleId) => api.get(`/analytics/article/${articleId}`),
};

// Student APIs
export const studentService = {
  saveHighlight: (highlightData) => api.post('/student/highlights', highlightData),
  getHighlights: (articleId) => api.get(`/student/highlights/${articleId}`),
  getAllHighlights: () => api.get('/student/highlights'),
  updateHighlight: (id, highlightData) => api.put(`/student/highlights/${id}`, highlightData),
  deleteHighlight: (id) => api.delete(`/student/highlights/${id}`),
};

// Tracking APIs
export const trackingService = {
  trackView: (articleId) => api.post('/tracking/view', { articleId }),
  trackTime: (articleId, timeSpent) => api.post('/tracking/time', { articleId, timeSpent }),
  markCompleted: (articleId) => api.post('/tracking/complete', { articleId }),
};

export default api;