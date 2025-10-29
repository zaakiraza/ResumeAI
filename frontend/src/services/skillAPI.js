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

// Skill API Service
export class SkillAPI {
  
  // Get skill suggestions based on search query
  static async getSkillSuggestions(query) {
    try {
      const searchParams = new URLSearchParams({ query, limit: 10 });
      const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.SKILL_SUGGESTIONS)}?${searchParams}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get Skill Suggestions Error:', error);
      throw error;
    }
  }

  // Get all skills with optional filters
  static async getAllSkills(filters = {}) {
    try {
      const searchParams = new URLSearchParams(filters);
      const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.SKILLS)}?${searchParams}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get All Skills Error:', error);
      throw error;
    }
  }

  // Get popular skills
  static async getPopularSkills(limit = 20, category = null) {
    try {
      const params = { limit };
      if (category) {
        params.category = category;
      }
      const searchParams = new URLSearchParams(params);
      const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.SKILL_POPULAR)}?${searchParams}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get Popular Skills Error:', error);
      throw error;
    }
  }

  // Get skills by category
  static async getSkillsByCategory() {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.SKILL_BY_CATEGORY);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get Skills By Category Error:', error);
      throw error;
    }
  }

  // Add a single skill (authenticated)
  static async addSkill(skillName, category = 'other') {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.SKILL_ADD);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ skillName, category }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Add Skill Error:', error);
      throw error;
    }
  }

  // Batch add/update skills (authenticated)
  static async batchAddSkills(skills) {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.SKILL_BATCH);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ skills }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Batch Add Skills Error:', error);
      throw error;
    }
  }

  // Verify a skill (admin only)
  static async verifySkill(skillId) {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.SKILL_VERIFY.replace(':id', skillId));
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Verify Skill Error:', error);
      throw error;
    }
  }

  // Update skill category (admin only)
  static async updateSkillCategory(skillId, category) {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.SKILL_UPDATE_CATEGORY.replace(':id', skillId));
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify({ category }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Update Skill Category Error:', error);
      throw error;
    }
  }
}

// Export individual functions for easier importing
export const {
  getSkillSuggestions,
  getAllSkills,
  getPopularSkills,
  getSkillsByCategory,
  addSkill,
  batchAddSkills,
  verifySkill,
  updateSkillCategory,
} = SkillAPI;

// Default export
export default SkillAPI;

