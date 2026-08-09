import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import CaptionEditor from '../components/CaptionEditor';
import PlatformSelector from '../components/PlatformSelector';
import PublishingStatusModal from '../components/PublishingStatusModal';
import { publishSocialPost } from '../api/socialApi';
import { useAuth } from '../context/AuthContext';
import { Send, Sparkles, AlertCircle } from 'lucide-react';

export default function SocialPublisher() {
  const { getToken } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['facebook', 'instagram']);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState(null);
  const [globalError, setGlobalError] = useState(null);

  const handleImageSelected = (file) => {
    setSelectedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleTogglePlatform = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  // Button disabled rule: disabled if no image or no platforms selected
  const isPublishDisabled = !selectedFile || selectedPlatforms.length === 0 || isPublishing;

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    if (isPublishDisabled) return;

    setIsPublishing(true);
    setGlobalError(null);
    setPublishResults(null);

    try {
      const response = await publishSocialPost(
        {
          imageFile: selectedFile,
          caption,
          platforms: selectedPlatforms
        },
        getToken()
      );

      if (response && response.results) {
        setPublishResults(response.results);
      } else {
        setGlobalError('Unexpected response from server.');
      }
    } catch (err) {
      console.error('Publishing error:', err);
      if (err.error && err.details) {
        setGlobalError(`${err.error}: ${err.details.join(', ')}`);
      } else {
        setGlobalError(err.message || 'An error occurred while publishing to social media.');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleResetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
    setSelectedPlatforms(['facebook', 'instagram']);
    setPublishResults(null);
    setGlobalError(null);
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Social Media Publisher
          </h1>
          <Sparkles size={22} style={{ color: 'var(--accent-primary)' }} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Compose and publish image posts directly to your Facebook Page and Instagram Business accounts using Meta Graph API.
        </p>
      </div>

      <form onSubmit={handlePublishSubmit}>
        <div className="publisher-grid">
          {/* Left Column: Image Upload & Preview */}
          <div className="panel-card">
            <ImageUploader
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              onImageSelected={handleImageSelected}
              onImageRemoved={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
            />
          </div>

          {/* Right Column: Caption, Platform Selection & Submit */}
          <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <CaptionEditor caption={caption} onChange={setCaption} />

            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onTogglePlatform={handleTogglePlatform}
            />

            {globalError && (
              <div
                style={{
                  background: 'var(--danger-bg)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  color: 'var(--danger-color)',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem'
                }}
              >
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <span>{globalError}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={isPublishDisabled}
              id="publish-submit-button"
            >
              {isPublishing ? (
                <>
                  <div className="spinner" />
                  <span>Publishing to Meta...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Publish Now</span>
                </>
              )}
            </button>

            {publishResults && (
              <PublishingStatusModal
                results={publishResults}
                onClose={() => setPublishResults(null)}
                onReset={handleResetForm}
              />
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
