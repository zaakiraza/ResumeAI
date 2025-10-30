import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDownload, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './ViewPDFModal.css';

const ViewPDFModal = ({ pdfUrl, resumeTitle, onClose, onDownload }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Close modal on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden'; // Prevent background scroll

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load PDF. The file may be unavailable.');
  };

  const handleDownloadClick = () => {
    if (onDownload) {
      onDownload();
    } else if (pdfUrl) {
      // Fallback: direct download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${resumeTitle || 'Resume'}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!pdfUrl) {
    return null;
  }

  return (
    <div className="pdf-modal-overlay" onClick={onClose}>
      <div className="pdf-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="pdf-modal-header">
          <div className="pdf-modal-title">
            <h2>{resumeTitle || 'Resume Preview'}</h2>
            <p className="pdf-modal-subtitle">Preview your resume before downloading</p>
          </div>
          <div className="pdf-modal-actions">
            <button
              className="pdf-modal-btn pdf-download-btn"
              onClick={handleDownloadClick}
              title="Download PDF"
            >
              <FontAwesomeIcon icon={faDownload} />
              <span>Download</span>
            </button>
            <button
              className="pdf-modal-btn pdf-close-btn"
              onClick={onClose}
              title="Close"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="pdf-modal-body">
          {isLoading && (
            <div className="pdf-loading">
              <FontAwesomeIcon icon={faSpinner} spin size="3x" />
              <p>Loading PDF...</p>
            </div>
          )}

          {error ? (
            <div className="pdf-error">
              <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
              <p>{error}</p>
              <button className="pdf-modal-btn" onClick={handleDownloadClick}>
                Try Direct Download
              </button>
            </div>
          ) : (
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              className="pdf-iframe"
              title="Resume PDF Preview"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="pdf-modal-footer">
          <p className="pdf-modal-hint">
            Use the toolbar above to zoom, navigate, and download the PDF
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewPDFModal;
