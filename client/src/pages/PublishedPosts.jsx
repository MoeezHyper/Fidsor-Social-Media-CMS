import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { fetchSocialPosts } from '../api/socialApi';
import {
  FileText,
  Facebook,
  Instagram,
  Search,
  Calendar,
  Heart,
  MessageSquare,
  ExternalLink,
  Eye,
  X,
  RefreshCw,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';

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

export default function PublishedPosts() {
  const { token } = useAuth();
  const [livePosts, setLivePosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all'); // 'all' | 'facebook' | 'instagram'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'likes'
  const [selectedPostModal, setSelectedPostModal] = useState(null);

  const [demoMode, setDemoMode] = useState(() => {
    return localStorage.getItem('fidsor_demo_mode') === 'true';
  });

  useEffect(() => {
    const handleDemoToggle = () => {
      const isDemo = localStorage.getItem('fidsor_demo_mode') === 'true';
      setDemoMode(isDemo);
    };
    window.addEventListener('fidsor_demo_mode_change', handleDemoToggle);
    return () => window.removeEventListener('fidsor_demo_mode_change', handleDemoToggle);
  }, []);

  const loadPosts = useCallback(async () => {
    if (demoMode) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchSocialPosts(token, true);
      if (data && Array.isArray(data.posts)) {
        setLivePosts(data.posts);
      } else {
        setLivePosts([]);
      }
    } catch (err) {
      console.error('Error fetching published posts:', err);
      setLivePosts([]);
    } finally {
      setLoading(false);
    }
  }, [token, demoMode]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const activePosts = demoMode ? DEMO_POSTS : livePosts;

  const filteredPosts = activePosts.filter(post => {
    const matchesSearch = (post.caption || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || post.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    if (sortBy === 'oldest') {
      return new Date(a.timestamp) - new Date(b.timestamp);
    }
    if (sortBy === 'likes') {
      return (b.likeCount || 0) - (a.likeCount || 0);
    }
    return 0;
  });

  return (
    <div className="page-wrapper published-posts-page">
      <div className="page-header-bar" style={{ marginBottom: 0 }}>
        <div>
          <div className="header-title-wrapper">
            <h1 className="page-title">Published Posts</h1>
            <span className="badge-pill-accent">
              <FileText size={14} />
              Publishing History ({activePosts.length})
            </span>
          </div>
          <p className="page-subtitle">
            Complete record of all content published across your connected Facebook Page & Instagram accounts.
          </p>
        </div>
      </div>

      {/* Separate Refresh Feed Row (above search & filter) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', marginBottom: '0.85rem' }}>
        <button className="btn-refresh-secondary" onClick={loadPosts} disabled={loading} title="Refresh Posts Feed">
          <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="table-controls-bar" style={{ marginTop: 0, marginBottom: '1.5rem' }}>
        <div className="search-input-wrapper" style={{ maxWidth: '360px' }}>
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by post caption..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <X size={13} />
            </button>
          )}
        </div>

        <div className="filter-sort-group">
          <div className="role-filter-pills">
            <button
              className={`filter-pill ${platformFilter === 'all' ? 'active' : ''}`}
              onClick={() => setPlatformFilter('all')}
            >
              All ({activePosts.length})
            </button>
            <button
              className={`filter-pill ${platformFilter === 'facebook' ? 'active' : ''}`}
              onClick={() => setPlatformFilter('facebook')}
            >
              <Facebook size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
              Facebook ({activePosts.filter(p => p.platform === 'facebook').length})
            </button>
            <button
              className={`filter-pill ${platformFilter === 'instagram' ? 'active' : ''}`}
              onClick={() => setPlatformFilter('instagram')}
            >
              <Instagram size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
              Instagram ({activePosts.filter(p => p.platform === 'instagram').length})
            </button>
          </div>

          <div className="sort-dropdown-wrapper">
            <ArrowUpDown size={14} className="sort-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      {sortedPosts.length === 0 ? (
        <div
          className="panel-card"
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            margin: '1.5rem 0',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--btn-secondary-bg)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}
          >
            <FileText size={28} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            {demoMode ? 'No Matching Posts' : 'No Published Posts Found'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto' }}>
            {demoMode
              ? 'No posts matched your current search or platform filter.'
              : 'No published posts were found on your connected social media accounts, or no accounts are connected in Live Mode.'}
          </p>
        </div>
      ) : (
        <div className="posts-grid" style={{ marginTop: 0 }}>
          {sortedPosts.map(post => (
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
                    <Eye size={16} /> View Post Details
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

      {/* Interactive Post Detail Portal Modal */}
      {selectedPostModal && ReactDOM.createPortal(
        <div className="modal-backdrop" onClick={() => setSelectedPostModal(null)}>
          <div className="post-modal-container" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
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
                    className="btn-primary modal-live-btn-compact"
                  >
                    <span>View Post on {selectedPostModal.platform === 'facebook' ? 'Facebook' : 'Instagram'}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}