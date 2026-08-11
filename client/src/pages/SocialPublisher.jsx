import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import CaptionEditor from '../components/CaptionEditor';
import PlatformSelector from '../components/PlatformSelector';
import PublishingStatusModal from '../components/PublishingStatusModal';
import { publishSocialPost } from '../api/socialApi';
import { useAuth } from '../context/AuthContext';
import { Send, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

function playPublishSuccessChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  } catch (e) {
    console.warn('Web Audio chime unavailable:', e);
  }
}

export default function SocialPublisher({ initialData }) {
  const { getToken } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || null);
  const [caption, setCaption] = useState(initialData?.caption || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => {
    const fbAuto = localStorage.getItem('fidsor_auto_fb') !== 'false';
    const igAuto = localStorage.getItem('fidsor_auto_ig') !== 'false';
    const initial = [];
    if (fbAuto) initial.push('facebook');
    if (igAuto) initial.push('instagram');
    return initial.length > 0 ? initial : ['facebook', 'instagram'];
  });
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
        const soundEnabled = localStorage.getItem('fidsor_sound_alerts') !== 'false';
        if (soundEnabled) {
          playPublishSuccessChime();
        }
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
      <div className="page-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div className="header-title-wrapper">
            <h1 className="page-title">Social Media Publisher</h1>
            <span className="badge-pill-accent">
              <Sparkles size={14} />
              Publishing Studio
            </span>
          </div>
          <p className="page-subtitle">
            Compose and publish image posts directly to your Facebook Page and Instagram Business accounts.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={handleResetForm}
          title="Reset image, caption, and platform selection"
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1rem', fontSize: '0.85rem' }}
        >
          <RotateCcw size={15} />
          <span>Reset Post</span>
        </button>
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
