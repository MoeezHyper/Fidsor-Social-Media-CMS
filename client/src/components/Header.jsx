import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Sun, Moon, LogOut } from 'lucide-react';

export default function Header({ theme, toggleTheme }) {
  const { profile, user, logout } = useAuth();

  const username = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Administrator';
  const role = profile?.role || 'user';

  return (
    <header className="header">
      <div className="header-title-group">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--header-title-color)' }}>Admin CMS</h2>
        <span className="header-badge">Meta Graph v19.0</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          id="theme-toggle-button"
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>

        <button
          className="btn-secondary"
          style={{ padding: '0.5rem', borderRadius: '50%' }}
          title="Notifications"
        >
          <Bell size={18} />
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--dropzone-bg)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.85rem'
            }}
          >
            {username.charAt(0).toUpperCase()}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {username}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {role}
            </span>
          </div>

          <button
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              marginLeft: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              padding: '0.2rem'
            }}
            title="Sign Out"
            id="logout-button"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
