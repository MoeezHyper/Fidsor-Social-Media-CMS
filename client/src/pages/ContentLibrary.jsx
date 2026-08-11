import React, { useState } from 'react';
import { FileText, Sparkles, Search, Copy, Check, Share2, Plus, Tag } from 'lucide-react';

const DEMO_TEMPLATES = [
  {
    id: 'tpl_101',
    title: 'Product Feature Launch',
    category: 'Promotional',
    caption: 'We are thrilled to unveil our latest feature update in Fidsor Social Media CMS! Streamline your multi-platform workflows effortlessly. #SocialMediaMarketing #ProductUpdate #FidsorCMS',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    tags: ['Product', 'Launch', 'Feature']
  },
  {
    id: 'tpl_102',
    title: 'Weekly Knowledge & Tips',
    category: 'Educational',
    caption: 'Pro Tip of the Week: High engagement social posts combine concise copywriting with eye-catching visual media. What design trends are working best for your brand this month? #MarketingTips #ContentStrategy',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    tags: ['Tips', 'Strategy', 'Engagement']
  },
  {
    id: 'tpl_103',
    title: 'Customer Spotlight & Testimonial',
    category: 'Social Proof',
    caption: '"Fidsor CMS cut our team publishing overhead in half while keeping our Facebook and Instagram accounts perfectly in sync." - Digital Agency Lead. See how Fidsor can scale your social reach!',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    tags: ['Testimonial', 'CaseStudy', 'Review']
  },
  {
    id: 'tpl_104',
    title: 'Event & Webinar Announcement',
    category: 'Events',
    caption: 'Join us live this Thursday for an exclusive deep dive into Meta Graph API v19.0 automation! Reserve your spot now before seats fill up. Link in bio. #Webinar #MetaGraph #SocialCMS',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    tags: ['Event', 'Webinar', 'Live']
  }
];

export default function ContentLibrary({ onUseInPublisher }) {
  const [templates, setTemplates] = useState(DEMO_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  const categories = ['All', 'Promotional', 'Educational', 'Social Proof', 'Events'];

  const filteredTemplates = templates.filter(tpl => {
    const matchesSearch = tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tpl.caption.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyCaption = (id, caption) => {
    navigator.clipboard.writeText(caption);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="page-wrapper content-library-page">
      <div className="page-header-bar">
        <div>
          <div className="header-title-wrapper">
            <h1 className="page-title">Content Library</h1>
            <span className="badge-pill-accent">
              <Sparkles size={14} />
              Templates & Saved Captions
            </span>
          </div>
          <p className="page-subtitle">
            Pre-approved post templates, saved captions, and draft assets ready for one-click publishing.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="table-controls-bar" style={{ marginTop: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search templates or captions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="role-filter-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="posts-grid" style={{ marginTop: '1.25rem' }}>
        {filteredTemplates.map(tpl => (
          <div className="post-card template-card" key={tpl.id}>
            {tpl.imageUrl && (
              <div className="post-media-container">
                <img src={tpl.imageUrl} alt={tpl.title} className="post-thumbnail" />
                <span className="post-platform-badge category-bg">
                  <Tag size={12} /> {tpl.category}
                </span>
              </div>
            )}

            <div className="post-card-body" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                {tpl.title}
              </h3>
              
              <p className="post-caption-snippet" style={{ flex: 1, WebkitLineClamp: 3, marginBottom: '0.75rem' }}>
                {tpl.caption}
              </p>

              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {tpl.tags.map(t => (
                  <span key={t} className="dropdown-item-badge" style={{ fontSize: '0.65rem' }}>#{t}</span>
                ))}
              </div>

              <div className="template-card-footer">
                <button
                  className="btn-primary template-btn-action"
                  onClick={() => onUseInPublisher && onUseInPublisher(tpl)}
                  title="Load template directly into Publisher"
                  style={{ flex: 1, width: '100%' }}
                >
                  <Share2 size={14} />
                  <span>Use Template</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}