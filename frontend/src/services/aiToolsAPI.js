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

class AIToolsAPI {
  static async generateSummary(input) {
    try {
      const response = await fetch(buildApiUrl('/ai/generate-summary'), {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ input }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Generate Summary Error:', error);
      throw error;
    }
  }

  static async enhanceExperience(input) {
    try {
      const response = await fetch(buildApiUrl('/ai/enhance-experience'), {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ input }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Enhance Experience Error:', error);
      throw error;
    }
  }

  static async analyzeSills(input) {
    try {
      const response = await fetch(buildApiUrl('/ai/analyze-skills'), {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ input }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Analyze Skills Error:', error);
      throw error;
    }
  }

  static async formatEducation(input) {
    try {
      const response = await fetch(buildApiUrl('/ai/format-education'), {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ input }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Format Education Error:', error);
      throw error;
    }
  }

  static async generateCoverLetter(input) {
    try {
      const response = await fetch(buildApiUrl('/ai/generate-cover-letter'), {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ input }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Generate Cover Letter Error:', error);
      throw error;
    }
  }
}

export default AIToolsAPI;