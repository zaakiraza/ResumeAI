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

// User API Service
export class UserAPI {
  
  // Get user profile
  static async getUserProfile() {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.GET_USER), {
        method: 'GET',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get User Profile Error:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(userData) {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.UPDATE_USER), {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify(userData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Update User Profile Error:', error);
      throw error;
    }
  }

  // Get user analytics
  static async getUserAnalytics() {
    try {
      const response = await fetch(buildApiUrl('/users/analytics'), {
        method: 'GET',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get User Analytics Error:', error);
      throw error;
    }
  }
}

// Export individual functions for easier importing
export const {
  getUserProfile,
  updateUserProfile,
  getUserAnalytics,
} = UserAPI;

// Default export
export default UserAPI;