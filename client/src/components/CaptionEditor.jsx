import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function CaptionEditor({ caption, onChange }) {
  const charLimit = 2200; // Standard Instagram caption character limit recommendation

  return (
    <div className="caption-container">
      <div className="section-header">
        <h3 className="section-title">
          <MessageSquare size={20} style={{ color: 'var(--accent-primary)' }} />
          2. Post Caption
        </h3>
        <p className="section-subtitle">Write a caption to accompany your image post</p>
      </div>

      <div className="textarea-wrapper">
        <textarea
          className="custom-textarea"
          rows={5}
          placeholder="Write your caption here... (e.g. Introducing our new product lineup! 🚀)"
          value={caption}
          onChange={(e) => onChange(e.target.value)}
          maxLength={charLimit}
          id="caption-textarea"
        />
        <div className="char-counter">
          {caption.length} / {charLimit} characters
        </div>
      </div>
    </div>
  );
}
