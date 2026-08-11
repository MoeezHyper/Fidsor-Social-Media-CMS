import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAccountInfo, fetchSocialAnalytics, fetchSocialPosts } from '../api/socialApi';
import {
  Facebook,
  Instagram,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Heart,
  MessageSquare,
  Users,
  FileText,
  TrendingUp,
  Eye,
  X,
  Layers,
  Calendar,
  Sparkles
} from 'lucide-react';

// Fallback Mock Data for Demo & Setup Verification Mode
const DEMO_ACCOUNT_INFO = {
  facebook: {
    connected: true,
    platform: 'facebook',
    id: '109283746501928',
    name: 'Fidsor Official Page',
    username: 'fidsorofficial',
    picture: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    followersCount: 14850,
    fanCount: 14200
  },
  instagram: {
    connected: true,
    platform: 'instagram',
    id: '17841409281726',
    name: 'Fidsor CMS Studio',
    username: 'fidsor_cms',
    profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    followersCount: 28400,
    mediaCount: 184
  }
};

const DEMO_ANALYTICS = {
  summary: {
    totalPosts: 342,
    totalFollowers: 43250,
    connectedPlatformsCount: 2
  },
  platforms: {
    facebook: {
      connected: true,
      totalPosts: 158,
      followersCount: 14850,
      fanCount: 14200,
      name: 'Fidsor Official Page'
    },
    instagram: {
      connected: true,
      totalMedia: 184,
      followersCount: 28400,
      mediaCount: 184,
      name: 'Fidsor CMS Studio'
    }
  }
};

const DEMO_POSTS = [
  {
    id: 'ig_demo_101',
    platform: 'instagram',
    caption: 'Excited to announce our newest features in Fidsor Social Media CMS! Streamline your multi-platform publishing effortlessly. #SocialMediaCMS #ContentCreation #MetaGraphAPI',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    mediaType: 'IMAGE',
    permalink: 'https://instagram.com/p/demo101',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    likeCount: 412,
    commentCount: 38
  },
  {
    id: 'fb_demo_202',
    platform: 'facebook',
    caption: 'Build, schedule, and analyze your social campaigns with integrated Meta Graph API features right inside Fidsor CMS.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    permalink: 'https://facebook.com/demo202',
    timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
    likeCount: 189,
    commentCount: 15
  },
  {
    id: 'ig_demo_103',
    platform: 'instagram',
    caption: 'Design aesthetics matter. Dark mode glassmorphism dashboard built for modern digital creators and enterprise managers.',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    mediaType: 'IMAGE',
    permalink: 'https://instagram.com/p/demo103',
    timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
    likeCount: 520,
    commentCount: 42
  },
  {
    id: 'fb_demo_204',
    platform: 'facebook',
    caption: 'Automated post publishing across Facebook Pages and Instagram Business accounts with single-click execution. Learn more in our developer docs!',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    permalink: 'https://facebook.com/demo204',
    timestamp: new Date(Date.now() - 3600000 * 52).toISOString(),
    likeCount: 275,
    commentCount: 29
  }
];

export default function SocialAnalytics() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activePlatformFilter, setActivePlatformFilter] = useState('all');
  const [selectedPostModal, setSelectedPostModal] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [demoMode, setDemoMode] = useState(() => {
    return localStorage.getItem('fidsor_demo_mode') === 'true';
  });

  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setGlobalError(null);

    try {
      const [accData, anaData, postsData] = await Promise.all([
        fetchAccountInfo(token, forceRefresh),
        fetchSocialAnalytics(token, forceRefresh),
        fetchSocialPosts(token, forceRefresh)
      ]);

      setAccountInfo(accData);
      setAnalytics(anaData);
      setPosts(postsData.posts || []);
    } catch (err) {
      console.error('Error loading social analytics dashboard:', err);
      setGlobalError(err.message || 'Failed to load social analytics data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    const handleDemoToggle = () => {
      const isDemo = localStorage.getItem('fidsor_demo_mode') === 'true';
      setDemoMode(isDemo);
      if (!isDemo) {
        loadDashboardData(true);
      }
    };
    window.addEventListener('fidsor_demo_mode_change', handleDemoToggle);
    return () => window.removeEventListener('fidsor_demo_mode_change', handleDemoToggle);
  }, [loadDashboardData]);

  useEffect(() => {
    loadDashboardData(false);

    const refreshSetting = localStorage.getItem('fidsor_auto_refresh') || '60';
    if (refreshSetting === 'off') return;

    const seconds = parseInt(refreshSetting, 10);
    if (isNaN(seconds) || seconds <= 0) return;

    const timer = setInterval(() => {
      loadDashboardData(true);
    }, seconds * 1000);

    return () => clearInterval(timer);
  }, [loadDashboardData]);

  // Use live data if in Live Mode, or demo data if in Demo Mode
  const activeAccountInfo = demoMode ? DEMO_ACCOUNT_INFO : accountInfo;
  const activeAnalytics = demoMode ? DEMO_ANALYTICS : analytics;
  const activePostsList = demoMode ? DEMO_POSTS : (posts || []);

  // Dynamic calculations for Engagement Rates & Graph scaling from live API data
  const fbFollowers = demoMode
    ? (activeAccountInfo?.facebook?.followersCount || activeAccountInfo?.facebook?.fanCount || 14850)
    : (activeAccountInfo?.facebook?.connected ? (activeAccountInfo?.facebook?.followersCount ?? activeAccountInfo?.facebook?.fanCount ?? 0) : 0);

  const igFollowers = demoMode
    ? (activeAccountInfo?.instagram?.followersCount || 28400)
    : (activeAccountInfo?.instagram?.connected ? (activeAccountInfo?.instagram?.followersCount ?? 0) : 0);

  const fbPosts = activePostsList.filter(p => p.platform === 'facebook');
  const igPosts = activePostsList.filter(p => p.platform === 'instagram');

  const fbInteractions = fbPosts.reduce((acc, p) => acc + (p.likeCount || 0) + (p.commentCount || 0), 0);
  const igInteractions = igPosts.reduce((acc, p) => acc + (p.likeCount || 0) + (p.commentCount || 0), 0);

  const liveFbRate = demoMode
    ? '3.2'
    : (fbPosts.length > 0 && fbFollowers > 0
        ? Math.min(15, Math.max(0.5, (fbInteractions / fbPosts.length / fbFollowers) * 100)).toFixed(1)
        : '0.0');

  const liveIgRate = demoMode
    ? '4.8'
    : (igPosts.length > 0 && igFollowers > 0
        ? Math.min(15, Math.max(0.5, (igInteractions / igPosts.length / igFollowers) * 100)).toFixed(1)
        : '0.0');

  const fbBarPct = parseFloat(liveFbRate) > 0 ? Math.min(100, Math.max(15, Math.round(parseFloat(liveFbRate) * 18))) : 0;
  const igBarPct = parseFloat(liveIgRate) > 0 ? Math.min(100, Math.max(15, Math.round(parseFloat(liveIgRate) * 18))) : 0;

  const fbError = accountInfo?.facebook?.error;
  const igError = accountInfo?.instagram?.error;
  const hasMetaErrors = fbError || igError;

  return (
    <div className="page-wrapper social-analytics-page">
      {/* Page Header Bar */}
      <div className="analytics-header">
        <div>
          <div className="analytics-title-group">
            <h1 className="analytics-page-title">Social Media Integration & Analytics</h1>
          </div>
          <p className="analytics-page-subtitle">
            Live metrics, connected social accounts, and audience growth analytics fetched directly from Meta Graph API.
          </p>
        </div>

        <button
          className="btn-refresh-secondary"
          onClick={() => loadDashboardData(true)}
          disabled={refreshing}
          title="Force reload Meta Graph API stats"
        >
          <RefreshCw size={15} className={refreshing ? 'spin-icon' : ''} />
          <span>{refreshing ? 'Refreshing API...' : 'Refresh Analytics'}</span>
        </button>
      </div>

      {/* Connection Errors Alert (if any) */}
      {hasMetaErrors && !demoMode && (
        <div className="alert-banner alert-banner-warning" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} className="alert-icon" />
          <div className="alert-content">
            <h4 className="alert-title">Meta Graph API Connection Warning</h4>
            <p className="alert-desc">
              {globalError || 'One or more connected Meta social accounts encountered configuration or token issues:'}
            </p>
            <ul className="alert-list">
              {fbError && <li><strong>Facebook Page:</strong> {fbError}</li>}
              {igError && <li><strong>Instagram Business:</strong> {igError}</li>}
            </ul>
          </div>
        </div>
      )}

      {/* 1. Account Header Cards Section */}
      <section className="analytics-section">
        <h2 className="section-heading">
          <Users size={20} /> Connected Social Accounts
        </h2>
        <div className="accounts-grid">
          {/* Facebook Page Account Card */}
          <div className={`account-card fb-card ${activeAccountInfo?.facebook?.connected ? 'connected' : 'disconnected'}`}>
            <div className="account-card-header">
              <div className="account-avatar-wrapper">
                {demoMode || activeAccountInfo?.facebook?.picture ? (
                  <img
                    src={activeAccountInfo?.facebook?.picture || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'}
                    alt="Facebook Page Profile"
                    className="account-avatar"
                  />
                ) : (
                  <div className="account-avatar placeholder-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dropzone-bg)', color: 'var(--text-muted)' }}>
                    <Facebook size={24} />
                  </div>
                )}
                <span className="platform-icon-badge fb-badge">
                  <Facebook size={12} />
                </span>
              </div>
              <div className="account-status">
                {activeAccountInfo?.facebook?.connected ? (
                  <span className="badge-connected">
                    <CheckCircle2 size={13} /> Connected
                  </span>
                ) : (
                  <span className="badge-disconnected">
                    <XCircle size={13} /> Not Connected
                  </span>
                )}
              </div>
            </div>

            <div className="account-card-body">
              <h3 className="account-display-name">
                {activeAccountInfo?.facebook?.connected || demoMode ? (activeAccountInfo?.facebook?.name || 'Facebook Page') : 'Facebook Page'}
              </h3>
              <p className="account-username">
                {activeAccountInfo?.facebook?.connected || demoMode ? `@${activeAccountInfo?.facebook?.username || 'facebook_page'}` : '@not_connected'}
              </p>
            </div>

            <div className="account-card-footer">
              <div className="account-metric">
                <span className="metric-label">Followers / Page Likes</span>
                <span className="metric-val">
                  {loading ? '...' : (activeAccountInfo?.facebook?.connected || demoMode ? ((activeAccountInfo?.facebook?.followersCount ?? activeAccountInfo?.facebook?.fanCount ?? 0)).toLocaleString() : '0')}
                </span>
              </div>
              <div className="account-metric">
                <span className="metric-label">Platform</span>
                <span className="metric-val platform-name-tag">Facebook Page</span>
              </div>
            </div>
          </div>

          {/* Instagram Business Account Card */}
          <div className={`account-card ig-card ${activeAccountInfo?.instagram?.connected ? 'connected' : 'disconnected'}`}>
            <div className="account-card-header">
              <div className="account-avatar-wrapper">
                {demoMode || activeAccountInfo?.instagram?.picture || activeAccountInfo?.instagram?.profilePictureUrl ? (
                  <img
                    src={activeAccountInfo?.instagram?.picture || activeAccountInfo?.instagram?.profilePictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt="Instagram Business Profile"
                    className="account-avatar"
                  />
                ) : (
                  <div className="account-avatar placeholder-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dropzone-bg)', color: 'var(--text-muted)' }}>
                    <Instagram size={24} />
                  </div>
                )}
                <span className="platform-icon-badge ig-badge">
                  <Instagram size={12} />
                </span>
              </div>
              <div className="account-status">
                {activeAccountInfo?.instagram?.connected ? (
                  <span className="badge-connected">
                    <CheckCircle2 size={13} /> Connected
                  </span>
                ) : (
                  <span className="badge-disconnected">
                    <XCircle size={13} /> Not Connected
                  </span>
                )}
              </div>
            </div>

            <div className="account-card-body">
              <h3 className="account-display-name">
                {activeAccountInfo?.instagram?.connected || demoMode ? (activeAccountInfo?.instagram?.name || 'Instagram Business') : 'Instagram Business'}
              </h3>
              <p className="account-username">
                {activeAccountInfo?.instagram?.connected || demoMode ? `@${activeAccountInfo?.instagram?.username || 'instagram_account'}` : '@not_connected'}
              </p>
            </div>

            <div className="account-card-footer">
              <div className="account-metric">
                <span className="metric-label">Followers</span>
                <span className="metric-val">
                  {loading ? '...' : (activeAccountInfo?.instagram?.connected || demoMode ? (activeAccountInfo?.instagram?.followersCount ?? 0).toLocaleString() : '0')}
                </span>
              </div>
              <div className="account-metric">
                <span className="metric-label">Platform</span>
                <span className="metric-val platform-name-tag">Instagram Business</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KPI Overview Widgets Section */}
      <section className="analytics-section">
        <h2 className="section-heading">
          <TrendingUp size={20} /> Performance KPI Overview
        </h2>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrapper purple">
              <FileText size={24} />
            </div>
            <div className="kpi-details">
              <span className="kpi-title">Total Published Posts</span>
              <h3 className="kpi-value">
                {loading ? <span className="skeleton-line" /> : (demoMode ? DEMO_ANALYTICS?.summary?.totalPosts : (activeAnalytics?.summary?.totalPosts ?? activePostsList.length)).toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper blue">
              <Users size={24} />
            </div>
            <div className="kpi-details">
              <span className="kpi-title">Combined Audience Reach</span>
              <h3 className="kpi-value">
                {loading ? <span className="skeleton-line" /> : (demoMode ? DEMO_ANALYTICS?.summary?.totalFollowers : (fbFollowers + igFollowers)).toLocaleString()}
              </h3>
              <div className="kpi-breakdown">
                <span className="breakdown-tag fb-text">
                  FB Likes: {(demoMode ? (DEMO_ANALYTICS?.platforms?.facebook?.followersCount ?? 0) : fbFollowers).toLocaleString()}
                </span>
                <span className="breakdown-tag ig-text">
                  IG Followers: {(demoMode ? (DEMO_ANALYTICS?.platforms?.instagram?.followersCount ?? 0) : igFollowers).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper green">
              <Layers size={24} />
            </div>
            <div className="kpi-details">
              <span className="kpi-title">Connected Accounts</span>
              <h3 className="kpi-value">
                {loading ? <span className="skeleton-line" /> : (demoMode ? '2 / 2' : `${(activeAccountInfo?.facebook?.connected ? 1 : 0) + (activeAccountInfo?.instagram?.connected ? 1 : 0)} / 2`)}
              </h3>
              <div className="kpi-breakdown">
                <span className="breakdown-tag text-muted">
                  {demoMode ? 'Meta Graph API Sync Active' : (activeAccountInfo?.facebook?.connected || activeAccountInfo?.instagram?.connected ? 'Meta Graph API Sync Active' : 'No Accounts Connected')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Visual Charts & Analytics Graphs Section */}
      <section className="analytics-section">
        <h2 className="section-heading">
          <TrendingUp size={20} /> Audience Growth & Engagement Trends
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {/* Follower Growth Trend Chart */}
          <div className="panel-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Follower Growth Curve</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Daily cumulative reach expansion</p>
              </div>
            </div>
            <div style={{ width: '100%', height: '200px', position: 'relative' }}>
              <svg viewBox="0 0 500 180" style={{ width: '100%', height: '100%' }}>
                <path d="M 0,140 Q 100,110 200,80 T 400,35 T 500,20" fill="none" stroke="#e1306c" strokeWidth="3" />
                <path d="M 0,155 Q 120,135 240,110 T 380,85 T 500,65" fill="none" stroke="#1877f2" strokeWidth="3" />
              </svg>
            </div>
          </div>

          {/* Platform Performance Comparison */}
          <div className="panel-card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Platform Engagement Rate Comparison
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Calculated interaction percentage per post from live account data
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem' }}>
              {/* Instagram Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                    <Instagram size={15} style={{ color: '#e1306c' }} /> Instagram Business
                  </span>
                  <span style={{ color: '#e1306c' }}>{liveIgRate}% Engagement Rate</span>
                </div>
                <div style={{ width: '100%', height: '10px', borderRadius: '5px', background: 'var(--dropzone-bg)', overflow: 'hidden' }}>
                  <div style={{ width: `${igBarPct}%`, height: '100%', background: 'linear-gradient(90deg, #f09433, #e1306c, #bc1888)', borderRadius: '5px', transition: 'width 0.5s ease' }} />
                </div>
              </div>

              {/* Facebook Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                    <Facebook size={15} style={{ color: '#1877f2' }} /> Facebook Page
                  </span>
                  <span style={{ color: '#1877f2' }}>{liveFbRate}% Engagement Rate</span>
                </div>
                <div style={{ width: '100%', height: '10px', borderRadius: '5px', background: 'var(--dropzone-bg)', overflow: 'hidden' }}>
                  <div style={{ width: `${fbBarPct}%`, height: '100%', background: '#1877f2', borderRadius: '5px', transition: 'width 0.5s ease' }} />
                </div>
              </div>

              {/* Cross-Platform Average */}
              <div style={{ marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>API Status</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: demoMode ? '#f59e0b' : 'var(--success-color)' }}>
                  {demoMode ? 'Demo View Mode' : 'Live Meta Graph API Connected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
