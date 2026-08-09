import React from 'react';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-dark)',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
          <span>Authenticating CMS Session...</span>
        </div>
      </div>
    );
  }

  if (!user && !profile) {
    return <Login />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="page-wrapper">
        <div
          className="panel-card"
          style={{
            maxWidth: '500px',
            margin: '4rem auto',
            textAlign: 'center',
            padding: '3rem 2rem'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--danger-bg)',
              color: 'var(--danger-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Access Restricted
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            You need Administrator privileges to access the User Management portal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'dashboardFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards' }}>
      <style>{`
        @keyframes dashboardFadeIn {
          from { opacity: 0; transform: scale(0.985); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      {children}
    </div>
  );
}
