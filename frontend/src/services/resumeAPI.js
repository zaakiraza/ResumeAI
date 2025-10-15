import { API_CONFIG, buildApiUrl } from '../config/api.js';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

// Helper function to build headers
const buildHeaders = (contentType = 'application/json') => {
  const headers = {
    'Content-Type': contentType,
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
};

// Resume API Service
export class ResumeAPI {
  
  // Create a new resume
  static async createResume(resumeData) {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.RESUMES), {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(resumeData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Create Resume Error:', error);
      throw error;
    }
  }

  // Get all user resumes with optional filters
  static async getUserResumes(params = {}) {
    try {
      const searchParams = new URLSearchParams(params);
      const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.RESUMES)}?${searchParams}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get User Resumes Error:', error);
      throw error;
    }
  }

  // Get a specific resume by ID
  static async getResumeById(resumeId) {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.RESUME_BY_ID.replace(':id', resumeId));
      
      const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get Resume Error:', error);
      throw error;
    }
  }

  // Update a resume
  static async updateResume(resumeId, resumeData) {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.RESUME_BY_ID.replace(':id', resumeId));
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify(resumeData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Update Resume Error:', error);
      throw error;
    }
  }

  // Delete a resume
  static async deleteResume(resumeId) {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.RESUME_BY_ID.replace(':id', resumeId));
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Delete Resume Error:', error);
      throw error;
    }
  }

  // Duplicate a resume
  static async duplicateResume(resumeId) {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.RESUME_DUPLICATE.replace(':id', resumeId));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Duplicate Resume Error:', error);
      throw error;
    }
  }

  // Update resume status
  static async updateResumeStatus(resumeId, status) {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.RESUME_STATUS.replace(':id', resumeId));
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: buildHeaders(),
        body: JSON.stringify({ status }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Update Resume Status Error:', error);
      throw error;
    }
  }

  // Track resume download
  static async trackDownload(resumeId) {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.RESUME_DOWNLOAD.replace(':id', resumeId));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Track Download Error:', error);
      throw error;
    }
  }

  // Download resume as PDF
  static async downloadPDF(resumeId, template = null) {
    try {
      let url = buildApiUrl(API_CONFIG.ENDPOINTS.RESUME_PDF.replace(':id', resumeId));
      
      // Add template query parameter if specified
      if (template) {
        url += `?template=${encodeURIComponent(template)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download PDF');
      }

      // Get filename from Content-Disposition header or create default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'resume.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Get PDF blob
      const blob = await response.blob();
      
      // Create download link and trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return {
        success: true,
        filename,
        message: 'PDF downloaded successfully'
      };

    } catch (error) {
      console.error('Download PDF Error:', error);
      throw error;
    }
  }

  // Save resume as draft (auto-save)
  static async saveAsDraft(resumeId, resumeData) {
    try {
      let url;
      if (resumeId && resumeId !== 'new') {
        url = buildApiUrl(API_CONFIG.ENDPOINTS.RESUME_DRAFT.replace(':id', resumeId));
      } else {
        url = buildApiUrl(API_CONFIG.ENDPOINTS.RESUME_NEW_DRAFT);
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(resumeData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Save Draft Error:', error);
      throw error;
    }
  }

  // Get available templates
  static async getTemplates() {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.RESUME_TEMPLATES);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get Templates Error:', error);
      throw error;
    }
  }
}

// Export individual functions for easier importing
export const {
  createResume,
  getUserResumes,
  getResumeById,
  updateResume,
  deleteResume,
  duplicateResume,
  updateResumeStatus,
  trackDownload,
  saveAsDraft,
  getTemplates,
  downloadPDF,
} = ResumeAPI;

// Default export
export default ResumeAPI;