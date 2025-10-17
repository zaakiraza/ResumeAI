import { useState, useEffect, useCallback } from 'react';
import { ResumeAPI } from '../services/resumeAPI.js';

// Custom hook for managing resume operations
export const useResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all user resumes
  const fetchResumes = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ResumeAPI.getUserResumes(params);
      setResumes(response.data.resumes || []);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Fetch resumes error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a resume
  const deleteResume = useCallback(async (resumeId) => {
    try {
      setLoading(true);
      await ResumeAPI.deleteResume(resumeId);
      // Remove from local state
      setResumes(prev => prev.filter(resume => resume._id !== resumeId));
    } catch (err) {
      setError(err.message);
      console.error('Delete resume error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Duplicate a resume
  const duplicateResume = useCallback(async (resumeId) => {
    try {
      setLoading(true);
      const response = await ResumeAPI.duplicateResume(resumeId);
      // Add to local state
      setResumes(prev => [response.data.resume, ...prev]);
      return response.data.resume;
    } catch (err) {
      setError(err.message);
      console.error('Duplicate resume error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update resume status
  const updateStatus = useCallback(async (resumeId, status) => {
    try {
      const response = await ResumeAPI.updateResumeStatus(resumeId, status);
      // Update local state
      setResumes(prev => 
        prev.map(resume => 
          resume._id === resumeId 
            ? { ...resume, status }
            : resume
        )
      );
      return response.data.resume;
    } catch (err) {
      setError(err.message);
      console.error('Update status error:', err);
      throw err;
    }
  }, []);

  // Track download for resume in list
  const trackDownload = useCallback(async (resumeId) => {
    try {
      await ResumeAPI.trackDownload(resumeId);
      // Update local state
      setResumes(prev => 
        prev.map(resume => 
          resume._id === resumeId 
            ? { ...resume, downloadCount: (resume.downloadCount || 0) + 1 }
            : resume
        )
      );
    } catch (err) {
      console.error('Track download error:', err);
    }
  }, []);

  // Download PDF for resume in list
  const downloadPDF = useCallback(async (resumeId, template = null) => {
    try {
      setLoading(true);
      const result = await ResumeAPI.downloadPDF(resumeId, template);
      
      // The backend already handles download tracking, so we just need to update local state
      // Update local state to reflect the download count increment
      setResumes(prev => 
        prev.map(resume => 
          resume._id === resumeId 
            ? { ...resume, downloadCount: (resume.downloadCount || 0) + 1 }
            : resume
        )
      );
      
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Download PDF error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    resumes,
    loading,
    error,
    fetchResumes,
    deleteResume,
    duplicateResume,
    updateStatus,
    trackDownload,
    downloadPDF,
    setError, // Allow manual error clearing
  };
};

// Custom hook for individual resume operations
export const useResume = (resumeId = null) => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch a specific resume
  const fetchResume = useCallback(async (id = resumeId) => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await ResumeAPI.getResumeById(id);
      setResume(response.data.resume);
      return response.data.resume;
    } catch (err) {
      setError(err.message);
      console.error('Fetch resume error:', err);
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  // Create new resume
  const createResume = useCallback(async (resumeData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ResumeAPI.createResume(resumeData);
      const created = response.data.resume;

      // Try to fetch generated PDF from backend and upload to Cloudinary
      try {
        // Fetch PDF blob from backend
        const pdfBlob = await ResumeAPI.fetchPDFBlob(created._id, created.selectedTemplate || created.template);

        if (pdfBlob) {
          // Convert blob to File for Cloudinary upload
          const filename = `${(created.personalInfo?.fullName || 'resume')}_${created._id}.pdf`;
          const file = new File([pdfBlob], filename, { type: 'application/pdf' });

          // Upload to Cloudinary
          const cloudResult = await import('../services/cloudinaryService.js').then(m => m.default.uploadFile(file, {
            folder: `resumeai/user-resume/${created.userId || created.userId}`,
          })).catch(err => {
            console.error('Cloudinary dynamic import/upload error:', err);
            return null;
          });

          if (cloudResult && cloudResult.success) {
            const pdfUrl = cloudResult.secure_url || cloudResult.url;

            // Update resume with pdfUrl
            try {
              await ResumeAPI.updateResume(created._id, { pdfUrl });
              // reflect in local state
              created.pdfUrl = pdfUrl;
            } catch (err) {
              console.error('Failed to save pdfUrl to resume:', err);
            }
          }
        }
      } catch (err) {
        console.error('PDF generation/upload flow failed:', err);
      }
+
      setResume(created);
      return created;
    } catch (err) {
      setError(err.message);
      console.error('Create resume error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update resume
  const updateResume = useCallback(async (id = resumeId, resumeData) => {
    if (!id) return;
    
    try {
      setSaving(true);
      setError(null);
      const response = await ResumeAPI.updateResume(id, resumeData);
      setResume(response.data.resume);
      return response.data.resume;
    } catch (err) {
      setError(err.message);
      console.error('Update resume error:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [resumeId]);

  // Save as draft (auto-save)
  const saveAsDraft = useCallback(async (id = resumeId, resumeData) => {
    try {
      setSaving(true);
      setError(null);
      const response = await ResumeAPI.saveAsDraft(id, resumeData);
      setResume(response.data.resume);
      return response.data.resume;
    } catch (err) {
      setError(err.message);
      console.error('Save draft error:', err);
      // Don't throw error for auto-save failures
    } finally {
      setSaving(false);
    }
  }, [resumeId]);

  // Track download
  const trackDownload = useCallback(async (id = resumeId) => {
    if (!id) return;
    
    try {
      await ResumeAPI.trackDownload(id);
      // Update local download count
      setResume(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null);
    } catch (err) {
      console.error('Track download error:', err);
      // Don't show error to user for tracking failures
    }
  }, [resumeId]);

  // Download PDF
  const downloadPDF = useCallback(async (id = resumeId, template = null) => {
    if (!id) return;
    
    try {
      setLoading(true);
      const result = await ResumeAPI.downloadPDF(id, template);
      
      setResume(prev => prev ? { ...prev, downloadCount: (prev.downloadCount || 0) + 1 } : null);
      
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Download PDF error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  // Load resume on mount if resumeId is provided
  useEffect(() => {
    if (resumeId) {
      fetchResume(resumeId);
    }
  }, [resumeId, fetchResume]);

  return {
    resume,
    loading,
    saving,
    error,
    fetchResume,
    createResume,
    updateResume,
    saveAsDraft,
    trackDownload,
    downloadPDF,
    setResume, // Allow manual resume updates
    setError,  // Allow manual error clearing
  };
};

// Hook for templates
export const useTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ResumeAPI.getTemplates();
      setTemplates(response.data.templates || []);
      return response.data.templates;
    } catch (err) {
      setError(err.message);
      console.error('Fetch templates error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load templates on mount
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
  };
};