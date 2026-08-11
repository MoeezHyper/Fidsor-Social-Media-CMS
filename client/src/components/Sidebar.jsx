import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Share2, LayoutDashboard, Users, FileText, Image as ImageIcon, Settings, X } from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab, isOpen, onClose }) {
  const { isAdmin } = useAuth();

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="brand-header-group">
            <div className="brand-logo-wrapper">
              <img
                src="/fidsor-logo.png"
                alt="Fidsor Logo"
                className="brand-logo-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <img
                src="/fidsor-favicon.png"
                alt="Fidsor Favicon"
                className="brand-favicon-img"
                style={{ display: 'none', width: '32px', height: '32px' }}
              />
            </div>
            <span className="brand-subtitle">Social Media CMS</span>
          </div>

          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
            id="sidebar-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'analytics' || activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectTab('analytics')}
            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            id="nav-social-analytics"
          >
            <LayoutDashboard size={18} />
            <span>Social Analytics</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'publisher' ? 'active' : ''}`}
            onClick={() => onSelectTab('publisher')}
            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            id="nav-social-publisher"
          >
            <Share2 size={18} />
            <span>Social Publisher</span>
          </button>

          {isAdmin && (
            <button
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => onSelectTab('users')}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
              id="nav-user-management"
            >
              <Users size={18} />
              <span>User Management</span>
            </button>
          )}

          <button
            className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => onSelectTab('library')}
            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            id="nav-content-library"
          >
            <FileText size={18} />
            <span>Content Library</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => onSelectTab('posts')}
            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            id="nav-published-posts"
          >
            <FileText size={18} />
            <span>Published Posts</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => onSelectTab('settings')}
            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', marginTop: 'auto' }}
            id="nav-settings"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>
      </aside>
    </>
  );
}

