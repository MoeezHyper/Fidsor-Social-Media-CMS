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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            className={`nav-item ${activeTab === 'publisher' ? 'active' : ''}`}
            onClick={() => onSelectTab('publisher')}
            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
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
            className={`nav-item ${activeTab === 'analytics' || activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectTab('analytics')}
            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            id="nav-social-analytics"
          >
            <LayoutDashboard size={18} />
            <span>Social Analytics</span>
          </button>

          <a href="#posts" className="nav-item" onClick={onClose}>
            <FileText size={18} />
            <span>Content Library</span>
          </a>
          <a href="#media" className="nav-item" onClick={onClose}>
            <ImageIcon size={18} />
            <span>Media Assets</span>
          </a>
          <a href="#settings" className="nav-item" style={{ marginTop: 'auto' }} onClick={onClose}>
            <Settings size={18} />
            <span>Settings</span>
          </a>
        </nav>
      </aside>
    </>
  );
}

