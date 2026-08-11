import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Search, Share2, Trash2, ExternalLink, Check, Sparkles } from 'lucide-react';

const DEMO_MEDIA = [
  {
    id: 'media_201',
    name: 'Abstract Neon Gradient Art',
    dimensions: '1080 x 1080',
    size: '1.2 MB',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    uploadedAt: 'Today, 11:30 AM'
  },
  {
    id: 'media_202',
    name: 'Analytics Dashboard Screen',
    dimensions: '1920 x 1080',
    size: '2.4 MB',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    uploadedAt: 'Yesterday'
  },
  {
    id: 'media_203',
    name: 'Dark Mode Workspace Setup',
    dimensions: '1080 x 1350',
    size: '1.8 MB',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    uploadedAt: 'Aug 09, 2026'
  },
  {
    id: 'media_204',
    name: 'Digital Growth Strategy Graph',
    dimensions: '1200 x 630',
    size: '950 KB',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    uploadedAt: 'Aug 07, 2026'
  },
  {
    id: 'media_205',
    name: 'Creative Studio Laptop',
    dimensions: '1080 x 1080',
    size: '1.5 MB',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    uploadedAt: 'Aug 05, 2026'
  }
];

export default function MediaAssets({ onUseInPublisher }) {
  const [mediaList, setMediaList] = useState(DEMO_MEDIA);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadUrlInput, setUploadUrlInput] = useState('');
  const [showAddUrlInput, setShowAddUrlInput] = useState(false);

  const filteredMedia = mediaList.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMediaUrl = (e) => {
    e.preventDefault();
    if (!uploadUrlInput.trim()) return;

    const newItem = {
      id: `media_${Date.now()}`,
      name: `Custom Upload #${mediaList.length + 1}`,
      dimensions: '1080 x 1080',
      size: 'Custom Web',
      url: uploadUrlInput.trim(),
      uploadedAt: 'Just now'
    };

    setMediaList([newItem, ...mediaList]);
    setUploadUrlInput('');
    setShowAddUrlInput(false);
  };

  const handleDeleteMedia = (id) => {
    setMediaList(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="page-wrapper media-assets-page">
      <div className="page-header-bar">
        <div>
          <div className="header-title-wrapper">
            <h1 className="page-title">Media Assets</h1>
            <span className="badge-pill-accent">
              <ImageIcon size={14} />
              Brand Asset Manager
            </span>
          </div>
          <p className="page-subtitle">
            Central repository for high-resolution images and campaign banners used in Facebook & Instagram publishing.
          </p>
        </div>

        <button
          className="btn-add-user-primary"
          onClick={() => setShowAddUrlInput(!showAddUrlInput)}
        >
          <Upload size={16} />
          <span>{showAddUrlInput ? 'Close Upload' : 'Upload Asset'}</span>
        </button>
      </div>

      {showAddUrlInput && (
        <div className="panel-card" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '0.95rem' }}>
            Add Image Asset by URL
          </h4>
          <form onSubmit={handleAddMediaUrl} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="url"
              className="custom-textarea minimal-input"
              placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
              value={uploadUrlInput}
              onChange={(e) => setUploadUrlInput(e.target.value)}
              style={{ flex: 1 }}
              required
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
              Add to Library
            </button>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="table-controls-bar" style={{ marginTop: 0 }}>
        <div className="search-input-wrapper" style={{ maxWidth: '400px' }}>
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search media assets by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="posts-grid" style={{ marginTop: '1.25rem' }}>
        {filteredMedia.map(item => (
          <div className="post-card media-asset-card" key={item.id}>
            <div className="post-media-container" style={{ height: '200px' }}>
              <img src={item.url} alt={item.name} className="post-thumbnail" />
              <span className="post-platform-badge fb-bg" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                {item.dimensions}
              </span>
            </div>

            <div className="post-card-body" style={{ padding: '0.85rem' }}>
              <h3 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.name}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Uploaded: {item.uploadedAt} • {item.size}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-primary"
                  onClick={() => onUseInPublisher && onUseInPublisher({ imageUrl: item.url })}
                  style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  title="Attach image in Social Publisher"
                >
                  <Share2 size={13} />
                  <span>Use in Publisher</span>
                </button>

                <button
                  className="icon-action-btn delete-action"
                  onClick={() => handleDeleteMedia(item.id)}
                  title="Delete media asset"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}