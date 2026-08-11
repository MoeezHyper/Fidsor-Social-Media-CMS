import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Facebook, Instagram, X } from 'lucide-react';

export default function PublishingStatusModal({ results, onClose, onReset }) {
  useEffect(() => {
    if (results && results.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [results]);

  if (!results || results.length === 0) return null;

  const hasErrors = results.some((r) => !r.success);

  return (
    <div className="status-results-panel">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}
      >
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Publishing Status Report
        </h4>
        <button
          onClick={onClose}
          className="btn-secondary"
          style={{ padding: '0.35rem', borderRadius: '50%' }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="status-grid">
        {results.map((res, idx) => {
          const isFb = res.platform?.toLowerCase() === 'facebook';
          const isSuccess = res.success;

          return (
            <div
              key={idx}
              className={`status-card ${isSuccess ? 'success' : 'failed'}`}
              id={`status-result-${res.platform}`}
            >
              <div className="status-icon">
                {isSuccess ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              </div>

              <div className="status-details">
                <div className="status-platform">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isFb ? <Facebook size={16} /> : <Instagram size={16} />}
                    <span>{isFb ? 'Facebook Page' : 'Instagram Business'}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      background: isSuccess ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'
                    }}
                  >
                    {isSuccess ? '✓ Published' : '✗ Failed'}
                  </span>
                </div>

                <div className="status-message">
                  {isSuccess ? (
                    <span>
                      Published successfully.{' '}
                      {res.postId || res.mediaId || res.id
                        ? `(ID: ${res.postId || res.mediaId || res.id})`
                        : ''}
                    </span>
                  ) : (
                    <span>
                      <strong>Reason:</strong> {res.message || 'Publishing failed.'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1.25rem',
          justifyContent: 'flex-end'
        }}
      >
        {!hasErrors && (
          <button type="button" className="btn-secondary" onClick={onReset}>
            Create Another Post
          </button>
        )}
        <button type="button" className="btn-primary" style={{ width: 'auto', marginTop: 0 }} onClick={onClose}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
