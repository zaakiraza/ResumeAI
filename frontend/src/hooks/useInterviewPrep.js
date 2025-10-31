import { useState } from 'react';
import { generateInterviewQuestions, generateAnswerSuggestion } from '../services/unifiedAIService';

/**
 * Hook for interview preparation features
 * Uses Chrome AI when available, falls back to OpenAI
 */
export const useInterviewPrep = () => {
  const [questions, setQuestions] = useState([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generate interview questions based on resume data
   * @param {Object} resumeData - { jobTitle, skills, experience }
   * @param {number} count - Number of questions to generate (default: 10)
   */
  const generateQuestions = async (resumeData, count = 10) => {
    setIsGeneratingQuestions(true);
    setError(null);

    try {
      const generatedQuestions = await generateInterviewQuestions(resumeData, count);
      
      // Ensure we have an array of questions
      const questionArray = Array.isArray(generatedQuestions) 
        ? generatedQuestions 
        : generatedQuestions.questions || [];
      
      setQuestions(questionArray);
      return questionArray;
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate interview questions';
      setError(errorMessage);
      console.error('Interview questions generation error:', err);
      throw new Error(errorMessage);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  /**
   * Generate answer suggestion for a specific question
   * @param {string} question - The interview question
   * @param {Object} resumeData - { jobTitle, skills, experience }
   * @returns {Promise<string>} Suggested answer
   */
  const generateAnswer = async (question, resumeData) => {
    setIsGeneratingAnswer(true);
    setError(null);

    try {
      const answer = await generateAnswerSuggestion(question, resumeData);
      return typeof answer === 'string' ? answer : answer.answer || answer.suggestion || '';
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate answer suggestion';
      setError(errorMessage);
      console.error('Answer generation error:', err);
      throw new Error(errorMessage);
    } finally {
      setIsGeneratingAnswer(false);
    }
  };

  /**
   * Clear all generated questions
   */
  const clearQuestions = () => {
    setQuestions([]);
    setError(null);
  };

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  return {
    // State
    questions,
    isGeneratingQuestions,
    isGeneratingAnswer,
    error,

    // Actions
    generateQuestions,
    generateAnswer,
    clearQuestions,
    clearError
  };
};

export default useInterviewPrep;
