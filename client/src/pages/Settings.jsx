import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle2, Sliders, RefreshCw, Bell, ShieldCheck, Share2 } from 'lucide-react';

export default function Settings() {
  const [defaultAutoSelectFb, setDefaultAutoSelectFb] = useState(() => {
    return localStorage.getItem('fidsor_auto_fb') !== 'false';
  });
  const [defaultAutoSelectIg, setDefaultAutoSelectIg] = useState(() => {
    return localStorage.getItem('fidsor_auto_ig') !== 'false';
  });
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(() => {
    return localStorage.getItem('fidsor_auto_refresh') || '60';
  });
  const [notificationsSound, setNotificationsSound] = useState(() => {
    return localStorage.getItem('fidsor_sound_alerts') !== 'false';
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('fidsor_auto_fb', defaultAutoSelectFb);
    localStorage.setItem('fidsor_auto_ig', defaultAutoSelectIg);
    localStorage.setItem('fidsor_auto_refresh', autoRefreshInterval);
    localStorage.setItem('fidsor_sound_alerts', notificationsSound);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="page-wrapper settings-page">
      <div className="page-header-bar" style={{ marginBottom: '2.25rem' }}>
        <div>
          <div className="header-title-wrapper">
            <h1 className="page-title">System Settings</h1>
            <span className="badge-pill-accent">
              <SettingsIcon size={14} />
              App Preferences
            </span>
          </div>
          <p className="page-subtitle">
            Configure default publishing targets, live sync intervals, and system notification preferences.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="alert-banner alert-banner-success" style={{ marginBottom: '1.5rem', maxWidth: '580px', margin: '0 auto 1.5rem auto' }}>
          <CheckCircle2 size={16} />
          <span style={{ fontSize: '0.85rem' }}>Preferences saved successfully!</span>
        </div>
      )}

      <div style={{ maxWidth: '580px', margin: '0 auto' }}>
        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Publishing Defaults Card */}
          <div className="panel-card" style={{ padding: '1.2rem' }}>
            <div className="section-header" style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="section-title" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                <Share2 size={16} style={{ color: 'var(--accent-primary)' }} />
                Default Publisher Platforms
              </h3>
              <p className="section-subtitle" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Select target networks to auto-enable when opening Social Publisher
              </p>
            </div>

            <div className="rights-selection-box" style={{ background: 'var(--dropzone-bg)', padding: '0.4rem 0.85rem' }}>
              <div className="rights-toggle-row" style={{ padding: '0.65rem 0' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>Facebook Page Auto-Selected</span>
                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    checked={defaultAutoSelectFb}
                    onChange={(e) => setDefaultAutoSelectFb(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              <div className="rights-toggle-row" style={{ padding: '0.65rem 0', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>Instagram Business Auto-Selected</span>
                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    checked={defaultAutoSelectIg}
                    onChange={(e) => setDefaultAutoSelectIg(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>
            </div>
          </div>

          {/* Sync & Refresh Settings Card */}
          <div className="panel-card" style={{ padding: '1.2rem' }}>
            <div className="section-header" style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="section-title" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                <RefreshCw size={16} style={{ color: 'var(--accent-primary)' }} />
                Live Sync & Refresh Behavior
              </h3>
              <p className="section-subtitle" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Set background polling frequency for live analytics metrics
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'block' }}>
                Live Analytics Auto-Refresh Interval
              </label>
              <select
                className="sort-select"
                style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.825rem' }}
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(e.target.value)}
              >
                <option value="off">Off (Manual Refresh Only)</option>
                <option value="30">Every 30 Seconds</option>
                <option value="60">Every 60 Seconds (Recommended)</option>
                <option value="300">Every 5 Minutes</option>
              </select>
            </div>

            <div className="rights-selection-box" style={{ background: 'var(--dropzone-bg)', padding: '0.4rem 0.85rem' }}>
              <div className="rights-toggle-row" style={{ padding: '0.65rem 0' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>Sound Alerts for Successfully Published Posts</span>
                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    checked={notificationsSound}
                    onChange={(e) => setNotificationsSound(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ height: '38px', padding: '0 1.25rem', fontSize: '0.825rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Save size={15} />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}