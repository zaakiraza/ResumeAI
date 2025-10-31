import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faEdit,
  faArrowLeft,
  faSpinner,
  faExclamationTriangle,
  faFilePdf,
  faShareAlt,
  faPrint,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { useResume } from '../../../hooks/useResume';
import './ViewResumePDF.css';

const ViewResumePDF = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resume, loading, error, fetchResume, downloadPDF, getPDFUrl } = useResume(id);
  
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Fetch resume data on mount
  useEffect(() => {
    if (id) {
      fetchResume();
    }
  }, [id, fetchResume]);

  // Fetch PDF URL when resume is loaded
  useEffect(() => {
    const loadPDF = async () => {
      if (!resume) return;
      
      setPdfLoading(true);
      setPdfError(null);
      
      try {
        const response = await getPDFUrl(id, resume.selectedTemplate);
        
        if (response && response.pdfUrl) {
          setPdfUrl(response.pdfUrl);
        } else {
          // If no PDF URL exists, generate one
          console.log('No PDF URL found, generating new PDF...');
          setPdfError('PDF preview not available. Please download to view.');
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        setPdfError('Failed to load PDF preview. You can still download it.');
      } finally {
        setPdfLoading(false);
      }
    };

    loadPDF();
  }, [resume, id, getPDFUrl]);

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      await downloadPDF(id, resume?.selectedTemplate);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadLoading(false);
    }
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share && pdfUrl) {
      try {
        await navigator.share({
          title: resume?.title || 'Resume',
          text: `Check out my resume: ${resume?.title}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: Copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="view-pdf-container">
        <div className="view-pdf-loading">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="view-pdf-container">
        <div className="view-pdf-error">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
          <h2>Resume Not Found</h2>
          <p>{error || 'The resume you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/my-resumes')} className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to My Resumes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-pdf-container">
      {/* Header */}
      <div className="view-pdf-header">
        <button onClick={() => navigate('/my-resumes')} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </button>
        
        <div className="resume-info">
          <h1>{resume.title}</h1>
          <span className="resume-template">Template: {resume.selectedTemplate || 'modern'}</span>
        </div>

        <div className="action-buttons">
          <button
            onClick={() => navigate(`/edit-resume/${id}`)}
            className="edit-button"
            title="Edit Resume"
          >
            <FontAwesomeIcon icon={faEdit} />
            <span>Edit</span>
          </button>

          {pdfUrl && (
            <>
              <button
                onClick={handlePrint}
                className="print-button"
                title="Print Resume"
              >
                <FontAwesomeIcon icon={faPrint} />
                <span>Print</span>
              </button>

              <button
                onClick={handleShare}
                className="share-button"
                title="Share Resume"
              >
                <FontAwesomeIcon icon={faShareAlt} />
                <span>Share</span>
              </button>
            </>
          )}

          <button
            onClick={handleDownload}
            className="download-button"
            disabled={downloadLoading}
            title="Download PDF"
          >
            <FontAwesomeIcon icon={downloadLoading ? faSpinner : faDownload} spin={downloadLoading} />
            <span>{downloadLoading ? 'Downloading...' : 'Download'}</span>
          </button>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="pdf-preview-container">
        {pdfLoading ? (
          <div className="pdf-loading">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            <p>Loading PDF preview...</p>
          </div>
        ) : pdfError ? (
          <div className="pdf-error">
            <FontAwesomeIcon icon={faFilePdf} size="3x" />
            <h3>Preview Not Available</h3>
            <p>{pdfError}</p>
            <button onClick={handleDownload} className="download-fallback-button">
              <FontAwesomeIcon icon={faDownload} />
              Download PDF Instead
            </button>
          </div>
        ) : pdfUrl ? (
          <div className="pdf-viewer">
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              title="Resume Preview"
              className="pdf-iframe"
            />
          </div>
        ) : (
          <div className="pdf-error">
            <FontAwesomeIcon icon={faFilePdf} size="3x" />
            <h3>No Preview Available</h3>
            <p>Unable to load PDF preview. Please download to view.</p>
            <button onClick={handleDownload} className="download-fallback-button">
              <FontAwesomeIcon icon={faDownload} />
              Download PDF
            </button>
          </div>
        )}
      </div>

      {/* Resume Details */}
      <div className="resume-details-section">
        <div className="resume-stats">
          <div className="stat-item">
            <FontAwesomeIcon icon={faEye} />
            <span>Views: {resume.downloadCount || 0}</span>
          </div>
          <div className="stat-item">
            <FontAwesomeIcon icon={faDownload} />
            <span>Downloads: {resume.downloadCount || 0}</span>
          </div>
          <div className="stat-item">
            <span className={`status-badge status-${resume.status}`}>
              {resume.status || 'draft'}
            </span>
          </div>
        </div>

        {resume.lastModified && (
          <div className="last-updated">
            Last updated: {new Date(resume.lastModified).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewResumePDF;
