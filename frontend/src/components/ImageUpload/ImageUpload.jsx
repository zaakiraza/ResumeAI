import React, { useRef, useState } from 'react';
import useImageUpload from '../../hooks/useImageUpload';
import './ImageUpload.css';

/**
 * Reusable image upload component with Cloudinary integration
 */
const ImageUpload = ({
  value,
  onChange,
  placeholder = "Click to upload image",
  accept = "image/*",
  disabled = false,
  showPreview = true,
  previewSize = "200px",
  folder = "resumeai",
  className = "",
  onUploadStart,
  onUploadComplete,
  onUploadError,
}) => {
  const fileInputRef = useRef(null);
  const { uploading, uploadProgress, error, uploadImage, uploadProfilePicture, clearError } = useImageUpload();
  const [preview, setPreview] = useState(value || null);
  const [dragActive, setDragActive] = useState(false);

  // Handle file selection
  const handleFileSelect = async (file) => {
    if (!file) return;

    // Clear any existing errors
    clearError();

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    // Notify parent of upload start
    if (onUploadStart) onUploadStart();

    // Upload to Cloudinary
    const result = folder === 'resumeai/profile-pictures' 
      ? await uploadProfilePicture(file)
      : await uploadImage(file, { folder });

    if (result && result.success) {
      // Update with Cloudinary URL
      setPreview(result.secure_url);
      onChange(result.secure_url);
      
      // Cleanup local preview
      URL.revokeObjectURL(localPreview);
      
      if (onUploadComplete) onUploadComplete(result);
    } else {
      // Revert to original value on error
      setPreview(value || null);
      if (onUploadError) onUploadError(error);
    }
  };

  // Handle file input change
  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  // Handle click to open file dialog
  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  // Handle remove image
  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`image-upload ${className}`}>
      <div
        className={`
          image-upload-container 
          ${dragActive ? 'drag-active' : ''}
          ${disabled ? 'disabled' : ''}
          ${uploading ? 'uploading' : ''}
        `}
        style={{ width: previewSize, height: previewSize }}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled || uploading}
          className="image-upload-input"
        />

        {/* Upload progress overlay */}
        {uploading && (
          <div className="upload-overlay">
            <div className="upload-progress-container">
              <div className="upload-spinner"></div>
              <div className="upload-progress-bar">
                <div 
                  className="upload-progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="upload-progress-text">
                {uploadProgress}%
              </span>
            </div>
          </div>
        )}

        {/* Preview or placeholder */}
        {showPreview && preview ? (
          <div className="image-preview-container">
            <img 
              src={preview} 
              alt="Preview" 
              className="image-preview"
            />
            {!uploading && (
              <button
                type="button"
                className="image-remove-btn"
                onClick={handleRemove}
                title="Remove image"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 15V3M12 3L8 7M12 3L16 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L2 19C2 20.1046 2.89543 21 4 21L20 21C21.1046 21 22 20.1046 22 19L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="upload-placeholder-text">{placeholder}</p>
            <p className="upload-hint">
              Drag & drop or click to select
            </p>
          </div>
        )}

        {/* Drag overlay */}
        {dragActive && (
          <div className="drag-overlay">
            <div className="drag-content">
              <span>Drop image here</span>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="upload-error">
          <span className="error-icon">⚠</span>
          <span className="error-message">{error}</span>
          <button 
            type="button" 
            className="error-dismiss"
            onClick={clearError}
          >
            ×
          </button>
        </div>
      )}

      {/* Upload status */}
      {uploading && (
        <div className="upload-status">
          <span>Uploading image... {uploadProgress}%</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;