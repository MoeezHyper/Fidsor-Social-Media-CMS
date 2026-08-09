import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, RefreshCw, AlertCircle } from 'lucide-react';

export default function ImageUploader({ selectedFile, previewUrl, onImageSelected, onImageRemoved }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const validateAndProcessFile = (file) => {
    setErrorMsg(null);
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSizeBytes = 8 * 1024 * 1024; // 8MB

    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Invalid file format. Please upload a JPG, JPEG, or PNG image.');
      return;
    }

    if (file.size > maxSizeBytes) {
      setErrorMsg('File size exceeds 8MB limit. Please choose a smaller image.');
      return;
    }

    onImageSelected(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndProcessFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndProcessFile(file);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="uploader-container">
      <div className="section-header">
        <h3 className="section-title">
          <ImageIcon size={20} style={{ color: 'var(--accent-primary)' }} />
          1. Select Image
        </h3>
        <p className="section-subtitle">Upload JPG, JPEG, or PNG image (Max 8MB)</p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/jpg,image/png"
        style={{ display: 'none' }}
        id="image-upload-input"
      />

      {errorMsg && (
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            color: 'var(--danger-color)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {!previewUrl ? (
        <div
          className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon-wrapper">
            <UploadCloud size={28} />
          </div>
          <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem' }}>
            Click to upload or drag & drop image
          </p>
          <p className="upload-hint">Supported formats: JPG, JPEG, PNG (Up to 8MB)</p>
        </div>
      ) : (
        <div className="preview-card">
          <div className="preview-image-container">
            <img src={previewUrl} alt="Post Preview" className="preview-image" />
          </div>
          <div className="preview-footer">
            <div className="preview-info">
              <span className="file-name">{selectedFile?.name || 'Uploaded Image'}</span>
              <span className="file-size">
                {selectedFile?.size ? formatFileSize(selectedFile.size) : ''}
              </span>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <RefreshCw size={15} />
              Replace Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
