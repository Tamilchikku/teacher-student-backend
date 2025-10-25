import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './pages/context/AuthContext';
import Layout from './components/common/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import Articles from './components/articles/Articles';
import ArticleDetail from './components/articles/ArticleDetail';
import CreateArticle from './components/articles/CreateArticle';
import Analytics from './components/analytics/Analytics';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="app-container">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register /> : <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} />} 
        />

        {/* Protected Routes */}
        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
          {/* Teacher Routes */}
          <Route 
            path="teacher" 
            element={user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/student" />} 
          />
          
          {/* Student Routes */}
          <Route 
            path="student" 
            element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/teacher" />} 
          />
          
          {/* Common Routes */}
          <Route path="articles" element={<Articles />} />
          <Route path="articles/create" element={<CreateArticle />} />
          <Route path="articles/:id" element={<ArticleDetail />} />
          <Route path="analytics" element={<Analytics />} />
          
          {/* Default redirect based on role */}
          <Route 
            index 
            element={<Navigate to={user?.role === 'teacher' ? 'teacher' : 'student'} />} 
          />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;