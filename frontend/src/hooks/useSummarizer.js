import { useState, useCallback } from 'react';
import { summarize as unifiedSummarize } from '../services/unifiedAIService';
import { createSummarizer, summarizeTextStreaming } from '../services/chromeAI/summarizerAPI';
import { toast } from 'react-toastify';

/**
 * React hook for using the Summarizer API with fallback
 * Uses Chrome AI when available, falls back to OpenAI
 * @returns {Object} Summarizer functions and state
 */
const useSummarizer = () => {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [streamingSummary, setStreamingSummary] = useState('');
  const [aiProvider, setAiProvider] = useState(null); // 'chrome' or 'openai'

  /**
   * Summarize text with options (uses unified service with fallback)
   * @param {string} text - Text to summarize
   * @param {Object} options - Summarization options
   * @returns {Promise<string>} Summary
   */
  const summarize = useCallback(async (text, options = {}) => {
    if (!text || text.trim().length === 0) {
      return '';
    }

    setIsSummarizing(true);
    setSummary('');
    
    try {
      // Use unified service with automatic fallback
      const result = await unifiedSummarize(text, options);
      
      // Result is a string from unified service
      const summaryResult = typeof result === 'string' ? result : result.summary || result.text || '';
      
      // Detect provider
      if (typeof result === 'string' && result.length > 0) {
        setAiProvider('chrome');
      } else {
        setAiProvider('openai');
      }
      
      setSummary(summaryResult);
      return summaryResult;
    } catch (error) {
      console.error('Summarization failed:', error);
      toast.error('Failed to summarize text. Please check your connection.');
      throw error;
    } finally {
      setIsSummarizing(false);
    }
  }, []);

  /**
   * Summarize with streaming (real-time updates)
   * Note: Streaming only works with Chrome AI
   */
  const summarizeStreaming = useCallback(async (text, options = {}, onChunk) => {
    if (!text || text.trim().length === 0) {
      return '';
    }

    setIsSummarizing(true);
    setStreamingSummary('');
    setAiProvider('chrome');
    let fullSummary = '';
    
    try {
      const summarizer = await createSummarizer({
        ...options,
        onDownloadProgress: (progress) => {
          if (progress < 100) {
            toast.info(`Downloading summarizer model: ${Math.round(progress)}%`);
          }
        }
      });

      const stream = await summarizeTextStreaming(summarizer, text, options.context);
      
      for await (const chunk of stream) {
        fullSummary = chunk;
        setStreamingSummary(chunk);
        if (onChunk) {
          onChunk(chunk);
        }
      }
      
      setSummary(fullSummary);
      
      // Cleanup
      if (summarizer.destroy) {
        summarizer.destroy();
      }
      
      return fullSummary;
    } catch (error) {
      console.error('Streaming summarization failed (falling back to unified service):', error);
      // Fall back to non-streaming unified service
      return summarize(text, options);
    } finally {
      setIsSummarizing(false);
    }
  }, [summarize]);

  /**
   * Create key points (bullet list)
   * @param {string} text - Text to summarize
   * @param {string} length - 'short' (3), 'medium' (5), 'long' (7) bullet points
   */
  const toKeyPoints = useCallback(async (text, length = 'medium', context) => {
    return summarize(text, {
      type: 'key-points',
      length,
      context: context || 'Extract key points'
    });
  }, [summarize]);

  /**
   * Create TLDR summary
   * @param {string} text - Text to summarize
   * @param {string} length - 'short' (1), 'medium' (3), 'long' (5) sentences
   */
  const toTLDR = useCallback(async (text, length = 'medium', context) => {
    return summarize(text, {
      type: 'tldr',
      length,
      context: context || 'Create a brief summary'
    });
  }, [summarize]);

  /**
   * Create teaser/preview
   * @param {string} text - Text to summarize
   * @param {string} length - 'short', 'medium', 'long'
   */
  const toTeaser = useCallback(async (text, length = 'medium', context) => {
    return summarize(text, {
      type: 'teaser',
      length,
      context: context || 'Create an engaging preview'
    });
  }, [summarize]);

  /**
   * Create headline
   * @param {string} text - Text to summarize
   * @param {string} length - 'short' (12), 'medium' (17), 'long' (22) words
   */
  const toHeadline = useCallback(async (text, length = 'medium', context) => {
    return summarize(text, {
      type: 'headline',
      length,
      context: context || 'Create a compelling headline'
    });
  }, [summarize]);

  /**
   * Summarize work experience (optimized for resumes)
   */
  const summarizeWorkExperience = useCallback(async (text, format = 'key-points') => {
    if (format === 'key-points') {
      return toKeyPoints(text, 'medium', 'Summarize work experience into professional bullet points');
    }
    return toTLDR(text, 'short', 'Summarize work experience professionally');
  }, [toKeyPoints, toTLDR]);

  /**
   * Summarize education (optimized for resumes)
   */
  const summarizeEducation = useCallback(async (text) => {
    return toTLDR(text, 'short', 'Summarize educational background concisely');
  }, [toTLDR]);

  /**
   * Summarize skills section
   */
  const summarizeSkills = useCallback(async (text) => {
    return toKeyPoints(text, 'short', 'List main technical and professional skills');
  }, [toKeyPoints]);

  /**
   * Create resume objective from longer text
   */
  const createObjective = useCallback(async (text) => {
    return toTLDR(text, 'short', 'Create a professional career objective statement');
  }, [toTLDR]);

  /**
   * Clear summary
   */
  const clear = useCallback(() => {
    setSummary('');
    setStreamingSummary('');
  }, []);

  return {
    // State
    isSummarizing,
    summary,
    streamingSummary,
    aiProvider, // Added to track which AI service is being used
    
    // Core functions
    summarize,
    summarizeStreaming,
    
    // Summary types
    toKeyPoints,
    toTLDR,
    toTeaser,
    toHeadline,
    
    // Resume-specific
    summarizeWorkExperience,
    summarizeEducation,
    summarizeSkills,
    createObjective,
    
    // Utilities
    clear
  };
};

export default useSummarizer;
