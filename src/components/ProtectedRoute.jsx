import { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function ProtectedRoute({ children, title, subtitle, actions }) {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border" style={{ color: 'var(--wv-primary)', width: 36, height: 36 }} />
          <div style={{ marginTop: 12, fontSize: 14, color: 'var(--wv-gray)' }}>Loading WattVue...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Mobile overlay — tap to close sidebar */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' is-active' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <div className="main-content">
        <Topbar
          title={title}
          subtitle={subtitle}
          actions={actions}
          onMenuClick={openSidebar}
        />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}
