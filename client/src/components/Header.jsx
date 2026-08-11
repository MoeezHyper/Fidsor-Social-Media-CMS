import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Sun, Moon, LogOut, Menu, X, ChevronDown, CheckCircle2, Sparkles } from 'lucide-react';

export default function Header({ theme, toggleTheme, toggleSidebar, isSidebarOpen }) {
  const { profile, user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(() => localStorage.getItem('fidsor_demo_mode') === 'true');

  const username = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Administrator';
  const role = profile?.role || 'user';

  const handleToggleDemoMode = () => {
    const next = !demoMode;
    setDemoMode(next);
    localStorage.setItem('fidsor_demo_mode', next ? 'true' : 'false');
    window.dispatchEvent(new Event('fidsor_demo_mode_change'));
  };

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="hamburger-btn"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Close Menu' : 'Open Menu'}
          id="mobile-hamburger-btn"
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="header-title-group">
          <div className="header-brand-wrapper">
            <img
              src="/fidsor-logo.png"
              alt="Fidsor Logo"
              className="header-brand-logo"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h2 className="header-title">CMS Admin Portal</h2>
          </div>
          <span className="header-badge">Meta Graph v19.0</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Demo Mode / Live Mode Quick Toggle Pill */}
        <button
          className="demo-live-toggle-btn"
          onClick={handleToggleDemoMode}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            background: demoMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: demoMode ? '#f59e0b' : '#10b981',
            border: demoMode ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title={demoMode ? 'Currently in Demo Mode - Click to switch to Live API Mode' : 'Currently in Live API Mode - Click to switch to Demo Mode'}
        >
          <Sparkles size={14} />
          <span>{demoMode ? 'Demo Mode' : 'Live Mode'}</span>
        </button>

        {/* Notifications Icon Button & Dropdown Wrapper */}
        <div className="header-notif-wrapper">
          <button
            className={`btn-secondary header-icon-btn ${notifMenuOpen ? 'active' : ''}`}
            onClick={() => {
              setNotifMenuOpen(!notifMenuOpen);
              setUserMenuOpen(false);
            }}
            style={{ padding: '0.55rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Notifications"
          >
            <Bell size={18} />
          </button>

          {notifMenuOpen && (
            <>
              <div
                className="admin-dropdown-backdrop"
                onClick={() => setNotifMenuOpen(false)}
              />
              <div className="notif-dropdown-menu">
                <div className="notif-dropdown-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bell size={15} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>Notifications</span>
                  </div>
                  <span className="notif-count-badge">0 New</span>
                </div>

                <div className="dropdown-divider" />

                <div className="notif-empty-state">
                  <CheckCircle2 size={22} style={{ color: 'var(--success-color)', opacity: 0.8 }} />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>No new notifications</span>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>You're all caught up!</small>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Unified Admin User Dropdown Trigger */}
        <div className="header-user-wrapper">
          <div
            className={`header-user-pill ${userMenuOpen ? 'active' : ''}`}
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotifMenuOpen(false);
            }}
            role="button"
            tabIndex={0}
            aria-expanded={userMenuOpen}
            aria-label="Admin User Menu"
          >
            <div className="header-user-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div className="header-user-details">
              <span className="header-user-name">
                {username}
              </span>
              <span className="header-user-role">
                {role}
              </span>
            </div>

            <ChevronDown size={15} className={`chevron-icon ${userMenuOpen ? 'rotated' : ''}`} />
          </div>

          {/* Admin Popover Dropdown Menu */}
          {userMenuOpen && (
            <>
              <div
                className="admin-dropdown-backdrop"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="admin-dropdown-menu">
                <div className="dropdown-user-header">
                  <div className="header-user-avatar" style={{ width: '36px', height: '36px', fontSize: '0.95rem' }}>
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-user-name">{username}</span>
                    <span className="dropdown-user-badge">{role}</span>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <div className="dropdown-section">
                  <button
                    className="admin-dropdown-item"
                    onClick={() => {
                      toggleTheme();
                    }}
                    id="theme-toggle-button"
                  >
                    <div className="dropdown-item-icon">
                      {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#6366f1" />}
                    </div>
                    <div className="dropdown-item-label">
                      <span>Theme</span>
                      <small>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</small>
                    </div>
                    <span className="dropdown-item-badge">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                  </button>
                </div>

                <div className="dropdown-divider" />

                <button
                  className="admin-dropdown-item logout-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  id="logout-button"
                >
                  <div className="dropdown-item-icon">
                    <LogOut size={15} style={{ color: 'var(--danger-color)' }} />
                  </div>
                  <div className="dropdown-item-label">
                    <span style={{ color: 'var(--danger-color)', fontWeight: 600 }}>Sign Out</span>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
