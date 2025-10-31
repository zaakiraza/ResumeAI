import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5003/api';

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Proofread text using OpenAI (fallback)
 */
export const proofreadWithOpenAI = async (text) => {
  try {
    const response = await apiClient.post('/ai-tools/proofread', { text });
    return {
      corrected: response.data.data.corrected,
      corrections: [], // OpenAI doesn't provide detailed corrections
      hasErrors: text !== response.data.data.corrected
    };
  } catch (error) {
    console.error('OpenAI proofread error:', error);
    throw new Error('Failed to proofread text with OpenAI');
  }
};

/**
 * Rewrite text using OpenAI (fallback)
 */
export const rewriteWithOpenAI = async (text, options = {}) => {
  try {
    const { tone, length } = options;
    const response = await apiClient.post('/ai-tools/rewrite', { text, tone, length });
    return response.data.data.rewritten;
  } catch (error) {
    console.error('OpenAI rewrite error:', error);
    throw new Error('Failed to rewrite text with OpenAI');
  }
};

/**
 * Summarize text using OpenAI (fallback)
 */
export const summarizeWithOpenAI = async (text, options = {}) => {
  try {
    const { length } = options;
    const response = await apiClient.post('/ai-tools/summarize', { text, length });
    return response.data.data.summary;
  } catch (error) {
    console.error('OpenAI summarize error:', error);
    throw new Error('Failed to summarize text with OpenAI');
  }
};

/**
 * Generate interview questions using OpenAI
 */
export const generateInterviewQuestionsWithOpenAI = async (data) => {
  try {
    const { jobTitle, skills, experience, count } = data;
    const response = await apiClient.post('/ai-tools/interview-questions', {
      jobTitle,
      skills,
      experience,
      count
    });
    return response.data.data.questions;
  } catch (error) {
    console.error('OpenAI interview questions error:', error);
    throw new Error('Failed to generate interview questions with OpenAI');
  }
};

/**
 * Generate answer suggestion using OpenAI
 */
export const generateAnswerSuggestionWithOpenAI = async (question, resumeData) => {
  try {
    const { jobTitle, skills, experience } = resumeData;
    const response = await apiClient.post('/ai-tools/answer-suggestion', {
      question,
      jobTitle,
      skills,
      experience
    });
    return response.data.data.answer;
  } catch (error) {
    console.error('OpenAI answer suggestion error:', error);
    throw new Error('Failed to generate answer suggestion with OpenAI');
  }
};

export default {
  proofreadWithOpenAI,
  rewriteWithOpenAI,
  summarizeWithOpenAI,
  generateInterviewQuestionsWithOpenAI,
  generateAnswerSuggestionWithOpenAI
};
