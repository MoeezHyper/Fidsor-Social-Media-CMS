import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, KeyRound, AlertCircle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(username, password);
      setIsSuccess(true);
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Invalid username or password.');
      setLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)',
        padding: '1rem'
      }}
    >
      <div
        className="panel-card login-panel-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {isSuccess ? (
          <div
            style={{
              padding: '1.5rem 0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              animation: 'fadeIn 0.4s ease forwards'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--success-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.3)'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Welcome back, {username}!
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Preparing your Social Media CMS workspace...
              </p>
            </div>

            {/* Smooth Animated Loading Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '6px',
                background: 'var(--dropzone-bg)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                marginTop: '1rem',
                border: '1px solid var(--border-color)'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  background: 'var(--accent-gradient)',
                  borderRadius: 'var(--radius-full)',
                  transformOrigin: 'left center',
                  animation: 'loadingProgress 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                }}
              />
            </div>

            <style>{`
              @keyframes loadingProgress {
                0% { transform: scaleX(0); }
                60% { transform: scaleX(0.75); }
                100% { transform: scaleX(1); }
              }
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>
        ) : (
          <>
            {/* Brand Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}
              >
                <img
                  src="/fidsor-logo.png"
                  alt="Fidsor Logo"
                  style={{ maxHeight: '42px', width: 'auto', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                CMS Admin Portal
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Sign in to access Social Media Publisher & Admin controls
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: 'var(--danger-bg)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  color: 'var(--danger-color)',
                  fontSize: '0.875rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="username-input"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '0.4rem'
                  }}
                >
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                  <input
                    id="username-input"
                    type="text"
                    className="custom-textarea"
                    style={{
                      minHeight: 'auto',
                      paddingLeft: '2.75rem',
                      height: '46px',
                      paddingTop: '0',
                      paddingBottom: '0',
                      lineHeight: '46px'
                    }}
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="password-input"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '0.4rem'
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                  <input
                    id="password-input"
                    type="password"
                    className="custom-textarea"
                    style={{
                      minHeight: 'auto',
                      paddingLeft: '2.75rem',
                      height: '46px',
                      paddingTop: '0',
                      paddingBottom: '0',
                      lineHeight: '46px'
                    }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ marginTop: '0.5rem' }}
                id="login-submit-button"
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
