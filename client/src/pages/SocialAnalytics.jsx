import React, { useState, useEffect, useCallback } from 'react';
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
    profilePictureUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f705e?w=150&auto=format&fit=crop&q=80',
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
    caption: '🚀 Excited to announce our newest features in Fidsor Social Media CMS! Streamline your multi-platform publishing effortlessly. #SocialMediaCMS #ContentCreation #MetaGraphAPI',
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
    caption: 'Design aesthetics matter. Dark mode glassmorphism dashboard built for modern digital creators and enterprise managers. ✨',
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
  const [demoMode, setDemoMode] = useState(false);

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

      // Check if both platforms returned disconnected/error states
      const fbConn = accData?.facebook?.connected;
      const igConn = accData?.instagram?.connected;
      if (!fbConn && !igConn) {
        setDemoMode(true);
      } else {
        setDemoMode(false);
      }
    } catch (err) {
      console.error('Error loading social analytics dashboard:', err);
      setGlobalError(err.message || 'Failed to load social analytics data.');
      setDemoMode(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboardData(false);
  }, [loadDashboardData]);

  // Use live data if available, or demo data if in demoMode
  const activeAccountInfo = demoMode ? DEMO_ACCOUNT_INFO : (accountInfo || DEMO_ACCOUNT_INFO);
  const activeAnalytics = demoMode ? DEMO_ANALYTICS : (analytics || DEMO_ANALYTICS);
  const activePostsList = demoMode ? DEMO_POSTS : (posts.length > 0 ? posts : DEMO_POSTS);

  const filteredPosts = activePostsList.filter(p => {
    if (activePlatformFilter === 'all') return true;
    return p.platform === activePlatformFilter;
  });

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
            {demoMode && (
              <span className="demo-mode-badge" title="Meta Graph API credentials pending or error fallback mode">
                <Sparkles size={14} /> Demo Preview Mode
              </span>
            )}
          </div>
          <p className="analytics-page-subtitle">
            Live accounts status, total post metrics, and recent published posts from Facebook Page & Instagram Business.
          </p>
        </div>

        <div className="analytics-header-actions">
          <button
            className="btn-secondary refresh-btn"
            onClick={() => loadDashboardData(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin-icon' : ''} />
            <span>{refreshing ? 'Refreshing Live Data...' : 'Refresh Live Data'}</span>
          </button>
        </div>
      </div>

      {/* Meta API Troubleshooting Alert Banner */}
      {(hasMetaErrors || globalError) && (
        <div className="meta-alert-banner">
          <div className="alert-icon-area">
            <AlertTriangle size={24} />
          </div>
          <div className="alert-content">
            <h3 className="alert-title">Meta Graph API Configuration Alert</h3>
            <p className="alert-desc">
              {globalError || 'One or more connected Meta social accounts encountered configuration or token issues:'}
            </p>
            <ul className="alert-list">
              {fbError && <li><strong>Facebook Page:</strong> {fbError}</li>}
              {igError && <li><strong>Instagram Business:</strong> {igError}</li>}
            </ul>
            <div className="alert-footer">
              <span className="alert-hint">
                💡 Update <code>META_PAGE_ID</code>, <code>META_PAGE_ACCESS_TOKEN</code>, and <code>INSTAGRAM_BUSINESS_ACCOUNT_ID</code> in <code>server/.env</code>.
              </span>
              <button
                className="toggle-demo-btn"
                onClick={() => setDemoMode(!demoMode)}
              >
                {demoMode ? 'Switch to Live API View' : 'Show Demo Visuals'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Account Header Cards Section */}
      <section className="analytics-section">
        <h2 className="section-heading">
          <Layers size={20} /> Connected Social Accounts
        </h2>
        <div className="account-cards-grid">
          {/* Facebook Page Account Card */}
          <div className={`account-card fb-card ${!activeAccountInfo?.facebook?.connected ? 'account-card-error' : ''}`}>
            <div className="account-card-top">
              <div className="account-avatar-wrapper">
                {activeAccountInfo?.facebook?.picture ? (
                  <img
                    src={activeAccountInfo.facebook.picture}
                    alt="Facebook Page Profile"
                    className="account-avatar"
                  />
                ) : (
                  <div className="account-avatar-placeholder fb-bg">
                    <Facebook size={26} />
                  </div>
                )}
                <span className="platform-mini-badge fb-bg">
                  <Facebook size={12} />
                </span>
              </div>

              <div className="account-status-badge-container">
                {activeAccountInfo?.facebook?.connected ? (
                  <span className="badge-connected">
                    <CheckCircle2 size={13} /> Connected
                  </span>
                ) : (
                  <span className="badge-disconnected">
                    <XCircle size={13} /> Connection Error
                  </span>
                )}
              </div>
            </div>

            <div className="account-card-body">
              <h3 className="account-display-name">
                {activeAccountInfo?.facebook?.name || 'Facebook Page'}
              </h3>
              <p className="account-username">
                @{activeAccountInfo?.facebook?.username || 'facebook_page'}
              </p>
            </div>

            <div className="account-card-footer">
              <div className="account-metric">
                <span className="metric-label">Followers / Page Likes</span>
                <span className="metric-val">
                  {loading ? '...' : (activeAccountInfo?.facebook?.followersCount ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="account-metric">
                <span className="metric-label">Platform</span>
                <span className="metric-val platform-name-tag">Facebook Page</span>
              </div>
            </div>
          </div>

          {/* Instagram Business Account Card */}
          <div className={`account-card ig-card ${!activeAccountInfo?.instagram?.connected ? 'account-card-error' : ''}`}>
            <div className="account-card-top">
              <div className="account-avatar-wrapper">
                {activeAccountInfo?.instagram?.profilePictureUrl ? (
                  <img
                    src={activeAccountInfo.instagram.profilePictureUrl}
                    alt="Instagram Business Profile"
                    className="account-avatar"
                  />
                ) : (
                  <div className="account-avatar-placeholder ig-bg">
                    <Instagram size={26} />
                  </div>
                )}
                <span className="platform-mini-badge ig-bg">
                  <Instagram size={12} />
                </span>
              </div>

              <div className="account-status-badge-container">
                {activeAccountInfo?.instagram?.connected ? (
                  <span className="badge-connected">
                    <CheckCircle2 size={13} /> Connected
                  </span>
                ) : (
                  <span className="badge-disconnected">
                    <XCircle size={13} /> Connection Error
                  </span>
                )}
              </div>
            </div>

            <div className="account-card-body">
              <h3 className="account-display-name">
                {activeAccountInfo?.instagram?.name || 'Instagram Business'}
              </h3>
              <p className="account-username">
                @{activeAccountInfo?.instagram?.username || 'instagram_account'}
              </p>
            </div>

            <div className="account-card-footer">
              <div className="account-metric">
                <span className="metric-label">Followers</span>
                <span className="metric-val">
                  {loading ? '...' : (activeAccountInfo?.instagram?.followersCount ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="account-metric">
                <span className="metric-label">Media Posts</span>
                <span className="metric-val">
                  {loading ? '...' : (activeAccountInfo?.instagram?.mediaCount ?? 0).toLocaleString()}
                </span>
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
          {/* KPI Widget: Total Posts Combined */}
          <div className="kpi-card">
            <div className="kpi-icon-wrapper purple">
              <FileText size={24} />
            </div>
            <div className="kpi-details">
              <span className="kpi-title">Total Published Posts</span>
              <h3 className="kpi-value">
                {loading ? <span className="skeleton-line" /> : (activeAnalytics?.summary?.totalPosts ?? 0).toLocaleString()}
              </h3>
              <div className="kpi-breakdown">
                <span className="breakdown-tag fb-text">
                  <Facebook size={12} /> FB: {activeAnalytics?.platforms?.facebook?.totalPosts ?? 0}
                </span>
                <span className="breakdown-tag ig-text">
                  <Instagram size={12} /> IG: {activeAnalytics?.platforms?.instagram?.totalMedia ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* KPI Widget: Total Combined Followers */}
          <div className="kpi-card">
            <div className="kpi-icon-wrapper blue">
              <Users size={24} />
            </div>
            <div className="kpi-details">
              <span className="kpi-title">Combined Audience Reach</span>
              <h3 className="kpi-value">
                {loading ? <span className="skeleton-line" /> : (activeAnalytics?.summary?.totalFollowers ?? 0).toLocaleString()}
              </h3>
              <div className="kpi-breakdown">
                <span className="breakdown-tag fb-text">
                  FB Likes: {activeAnalytics?.platforms?.facebook?.followersCount ?? 0}
                </span>
                <span className="breakdown-tag ig-text">
                  IG Followers: {activeAnalytics?.platforms?.instagram?.followersCount ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* KPI Widget: Active Platform Integrations */}
          <div className="kpi-card">
            <div className="kpi-icon-wrapper green">
              <Layers size={24} />
            </div>
            <div className="kpi-details">
              <span className="kpi-title">Connected Accounts</span>
              <h3 className="kpi-value">
                {loading ? <span className="skeleton-line" /> : `${activeAnalytics?.summary?.connectedPlatformsCount ?? 0} / 2`}
              </h3>
              <div className="kpi-breakdown">
                <span className="breakdown-tag text-muted">
                  Meta Graph v19.0 API Sync Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Published Posts Feed Grid Section */}
      <section className="analytics-section">
        <div className="posts-feed-header">
          <div>
            <h2 className="section-heading" style={{ marginBottom: 0 }}>
              <FileText size={20} /> Latest Published Posts
            </h2>
            <p className="section-subtitle">
              Recent published media posts fetched from Meta Graph API ordered by newest first.
            </p>
          </div>

          {/* Platform Filter Tabs */}
          <div className="platform-filter-tabs">
            <button
              className={`filter-tab ${activePlatformFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActivePlatformFilter('all')}
            >
              All Platforms ({activePostsList.length})
            </button>
            <button
              className={`filter-tab ${activePlatformFilter === 'facebook' ? 'active' : ''}`}
              onClick={() => setActivePlatformFilter('facebook')}
            >
              <Facebook size={14} /> Facebook ({activePostsList.filter(p => p.platform === 'facebook').length})
            </button>
            <button
              className={`filter-tab ${activePlatformFilter === 'instagram' ? 'active' : ''}`}
              onClick={() => setActivePlatformFilter('instagram')}
            >
              <Instagram size={14} /> Instagram ({activePostsList.filter(p => p.platform === 'instagram').length})
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="posts-grid">
            {[1, 2, 3, 4].map(idx => (
              <div className="post-card skeleton-card" key={idx}>
                <div className="skeleton-thumb" />
                <div className="skeleton-body">
                  <div className="skeleton-line" style={{ width: '40%' }} />
                  <div className="skeleton-line" style={{ width: '90%' }} />
                  <div className="skeleton-line" style={{ width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="empty-posts-state panel-card">
            <FileText size={42} className="text-muted" />
            <h3>No Published Posts Found</h3>
            <p>Publish your first post using the Fidsor Social Publisher tool to view live post analytics here.</p>
          </div>
        ) : (
          <div className="posts-grid">
            {filteredPosts.map(post => (
              <div className="post-card" key={post.id}>
                <div className="post-media-container" onClick={() => setSelectedPostModal(post)}>
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt="Published post thumbnail"
                      className="post-thumbnail"
                      loading="lazy"
                    />
                  ) : (
                    <div className="post-no-image">
                      <FileText size={32} />
                      <span>Text Post</span>
                    </div>
                  )}

                  <div className="post-media-overlay">
                    <span className="overlay-preview-btn">
                      <Eye size={16} /> Preview Image
                    </span>
                  </div>

                  <span className={`post-platform-badge ${post.platform === 'facebook' ? 'fb-bg' : 'ig-bg'}`}>
                    {post.platform === 'facebook' ? <Facebook size={12} /> : <Instagram size={12} />}
                    {post.platform === 'facebook' ? 'Facebook' : 'Instagram'}
                  </span>
                </div>

                <div className="post-card-body">
                  <div className="post-timestamp">
                    <Calendar size={13} />
                    {new Date(post.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>

                  <p className="post-caption-snippet">
                    {post.caption || <em className="text-muted">No caption provided</em>}
                  </p>

                  <div className="post-metrics-bar">
                    <div className="post-metric-item" title="Likes Count">
                      <Heart size={15} className="heart-icon" />
                      <span>{(post.likeCount || 0).toLocaleString()}</span>
                    </div>
                    <div className="post-metric-item" title="Comments Count">
                      <MessageSquare size={15} className="comment-icon" />
                      <span>{(post.commentCount || 0).toLocaleString()}</span>
                    </div>

                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="permalink-link"
                      title="Open Live Post on Social Network"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>View Live</span> <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Interactive Image Preview Modal */}
      {selectedPostModal && (
        <div className="post-modal-backdrop" onClick={() => setSelectedPostModal(null)}>
          <div className="post-modal-container" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setSelectedPostModal(null)}
              title="Close Modal"
            >
              <X size={20} />
            </button>

            <div className="post-modal-content">
              <div className="modal-image-side">
                {selectedPostModal.imageUrl ? (
                  <img
                    src={selectedPostModal.imageUrl}
                    alt="Full size published media preview"
                    className="modal-full-img"
                  />
                ) : (
                  <div className="modal-no-img">
                    <FileText size={48} />
                    <span>No image attachment</span>
                  </div>
                )}
              </div>

              <div className="modal-info-side">
                <div className="modal-header">
                  <span className={`post-platform-badge ${selectedPostModal.platform === 'facebook' ? 'fb-bg' : 'ig-bg'}`}>
                    {selectedPostModal.platform === 'facebook' ? <Facebook size={14} /> : <Instagram size={14} />}
                    {selectedPostModal.platform === 'facebook' ? 'Facebook Page Post' : 'Instagram Media'}
                  </span>
                  <span className="modal-timestamp">
                    {new Date(selectedPostModal.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="modal-caption-box">
                  <h4>Post Caption</h4>
                  <p>{selectedPostModal.caption || 'No text caption included.'}</p>
                </div>

                <div className="modal-engagement-stats">
                  <div className="stat-pill">
                    <Heart size={18} className="heart-icon" />
                    <span><strong>{(selectedPostModal.likeCount || 0).toLocaleString()}</strong> Likes</span>
                  </div>
                  <div className="stat-pill">
                    <MessageSquare size={18} className="comment-icon" />
                    <span><strong>{(selectedPostModal.commentCount || 0).toLocaleString()}</strong> Comments</span>
                  </div>
                </div>

                <div className="modal-footer">
                  <a
                    href={selectedPostModal.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary modal-live-btn"
                  >
                    <span>View Live Post on {selectedPostModal.platform === 'facebook' ? 'Facebook' : 'Instagram'}</span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
