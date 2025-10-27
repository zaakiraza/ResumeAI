import { useState } from 'react';
import AIToolsAPI from '../services/aiToolsAPI';

export const useAITools = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateContent = async (toolId, input) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      switch (toolId) {
        case 'summary':
          response = await AIToolsAPI.generateSummary(input);
          break;
        case 'experience':
          response = await AIToolsAPI.enhanceExperience(input);
          break;
        case 'skills':
          response = await AIToolsAPI.analyzeSills(input);
          break;
        case 'education':
          response = await AIToolsAPI.formatEducation(input);
          break;
        case 'cover-letter':
          response = await AIToolsAPI.generateCoverLetter(input);
          break;
        default:
          throw new Error('Invalid tool selected');
      }
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateContent,
    setError, // Expose setError to allow manual error clearing
  };
};