import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Sun, Moon, LogOut, Menu, X, ChevronDown } from 'lucide-react';

export default function Header({ theme, toggleTheme, toggleSidebar, isSidebarOpen }) {
  const { profile, user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const username = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Administrator';
  const role = profile?.role || 'user';

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
          <h2 className="header-title">Admin CMS</h2>
          <span className="header-badge">Meta Graph v19.0</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Desktop Theme Toggle & Notifications */}
        <button
          className="theme-toggle-btn desktop-only-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          id="theme-toggle-button"
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          <span className="theme-toggle-label">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>

        <button
          className="btn-secondary header-icon-btn desktop-only-btn"
          style={{ padding: '0.5rem', borderRadius: '50%' }}
          title="Notifications"
        >
          <Bell size={18} />
        </button>

        {/* User Pill & Mobile User Menu Trigger */}
        <div className="header-user-wrapper">
          <div
            className="header-user-pill"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            role="button"
            tabIndex={0}
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

            <button
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              className="header-logout-btn desktop-only-btn"
              title="Sign Out"
              id="logout-button"
            >
              <LogOut size={16} />
            </button>

            <ChevronDown size={14} className="mobile-chevron-icon" />
          </div>

          {/* Mobile User Popover Menu */}
          {userMenuOpen && (
            <>
              <div
                className="mobile-popover-backdrop"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="mobile-user-popover">
                <div className="popover-user-info">
                  <div className="header-user-avatar" style={{ width: '38px', height: '38px', fontSize: '1rem' }}>
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{role}</div>
                  </div>
                </div>

                <div className="popover-divider" />

                <button
                  className="popover-action-btn"
                  onClick={() => {
                    toggleTheme();
                    setUserMenuOpen(false);
                  }}
                >
                  {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
                  <span>{theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
                </button>

                <button
                  className="popover-action-btn"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Bell size={18} color="var(--accent-primary)" />
                  <span>Notifications</span>
                </button>

                <div className="popover-divider" />

                <button
                  className="popover-action-btn logout-action"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={18} color="var(--danger-color)" />
                  <span style={{ color: 'var(--danger-color)' }}>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
