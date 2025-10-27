import axios from 'axios';
import { API_BASE_URL } from '../config/api';

class AIToolsAPI {
  static async generateSummary(input) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/generate-summary`, { input });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async enhanceExperience(input) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/enhance-experience`, { input });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async analyzeSills(input) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/analyze-skills`, { input });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async formatEducation(input) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/format-education`, { input });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async generateCoverLetter(input) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/generate-cover-letter`, { input });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static handleError(error) {
    if (error.response) {
      // Server responded with error
      return new Error(error.response.data.message || 'Server error occurred');
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server');
    } else {
      // Other errors
      return new Error('Error occurred while processing request');
    }
  }
}

export default AIToolsAPI;