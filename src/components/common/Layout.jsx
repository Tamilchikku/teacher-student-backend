import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../pages/context/AuthContext';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const teacherNavigation = [
    { name: 'Dashboard', href: '/teacher', icon: '📊' },
    { name: 'Articles', href: '/articles', icon: '📝' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
  ];

  const studentNavigation = [
    { name: 'Dashboard', href: '/student', icon: '📊' },
    { name: 'Articles', href: '/articles', icon: '📚' },
    { name: 'My Progress', href: '/analytics', icon: '📈' },
  ];

  const navigation = user?.role === 'teacher' ? teacherNavigation : studentNavigation;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getPageTitle = () => {
    const currentNav = navigation.find(item => isActive(item.href));
    return currentNav ? currentNav.name : 'Dashboard';
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-icon">📊</span>
            <span className="brand-text">EduAnalytics</span>
          </div>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                navigate(item.href);
                setSidebarOpen(false);
              }}
              className={`nav-item ${isActive(item.href) ? 'nav-item-active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            🚪
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="page-title">
            {getPageTitle()}
          </div>
          <div className="user-welcome">
            Welcome, {user?.name}!
          </div>
        </div>

        {/* Page Content */}
        <div className="content-area">
          <Outlet />
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;