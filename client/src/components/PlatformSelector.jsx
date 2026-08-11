import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Share2, Check, Facebook, Instagram, Lock } from 'lucide-react';

export default function PlatformSelector({ selectedPlatforms, onTogglePlatform }) {
  const { profile } = useAuth();

  const canFb = profile?.can_publish_facebook !== false;
  const canIg = profile?.can_publish_instagram !== false;

  const isFacebookSelected = selectedPlatforms.includes('facebook') && canFb;
  const isInstagramSelected = selectedPlatforms.includes('instagram') && canIg;

  return (
    <div className="platforms-container">
      <div className="section-header">
        <h3 className="section-title">
          <Share2 size={20} style={{ color: 'var(--accent-primary)' }} />
          3. Select Platforms
        </h3>
        <p className="section-subtitle">Choose destination platforms (subject to user permissions)</p>
      </div>

      <div className="platforms-grid">
        {/* Facebook Page Option */}
        <div
          className={`platform-checkbox-card ${isFacebookSelected ? 'selected-fb' : ''} ${!canFb ? 'disabled-platform' : ''}`}
          onClick={() => canFb && onTogglePlatform('facebook')}
          role="checkbox"
          aria-checked={isFacebookSelected}
          aria-disabled={!canFb}
          tabIndex={canFb ? 0 : -1}
          style={{ opacity: canFb ? 1 : 0.5, cursor: canFb ? 'pointer' : 'not-allowed' }}
          id="platform-facebook"
        >
          <div className="platform-info">
            <div className="platform-icon-badge fb-bg">
              <Facebook size={20} />
            </div>
            <div>
              <div className="platform-name">Facebook</div>
              {!canFb && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  No Permission
                </div>
              )}
            </div>
          </div>
          <div className="custom-checkbox">
            {!canFb ? <Lock size={12} color="var(--text-dim)" /> : isFacebookSelected && <Check size={14} color="#fff" strokeWidth={3} />}
          </div>
        </div>

        {/* Instagram Business Option */}
        <div
          className={`platform-checkbox-card ${isInstagramSelected ? 'selected-ig' : ''} ${!canIg ? 'disabled-platform' : ''}`}
          onClick={() => canIg && onTogglePlatform('instagram')}
          role="checkbox"
          aria-checked={isInstagramSelected}
          aria-disabled={!canIg}
          tabIndex={canIg ? 0 : -1}
          style={{ opacity: canIg ? 1 : 0.5, cursor: canIg ? 'pointer' : 'not-allowed' }}
          id="platform-instagram"
        >
          <div className="platform-info">
            <div className="platform-icon-badge ig-bg">
              <Instagram size={20} />
            </div>
            <div>
              <div className="platform-name">Instagram</div>
              {!canIg && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  No Permission
                </div>
              )}
            </div>
          </div>
          <div className="custom-checkbox">
            {!canIg ? <Lock size={12} color="var(--text-dim)" /> : isInstagramSelected && <Check size={14} color="#fff" strokeWidth={3} />}
          </div>
        </div>
      </div>
    </div>
  );
}
