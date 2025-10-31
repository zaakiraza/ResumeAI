import { useState, useCallback } from 'react';
import { proofread as unifiedProofread } from '../services/unifiedAIService';
import { createProofreader } from '../services/chromeAI/proofreaderAPI';
import { toast } from 'react-toastify';

/**
 * React hook for using the Proofreader API with fallback
 * Uses Chrome AI when available, falls back to OpenAI
 * @returns {Object} Proofreader functions and state
 */
const useProofreader = () => {
  const [isProofreading, setIsProofreading] = useState(false);
  const [proofreader, setProofreader] = useState(null);
  const [corrections, setCorrections] = useState([]);
  const [aiProvider, setAiProvider] = useState(null); // 'chrome' or 'openai'

  /**
   * Initialize proofreader session (Chrome AI only)
   * Note: This is optional as unified service handles initialization
   */
  const initialize = useCallback(async (options = {}) => {
    try {
      const session = await createProofreader({
        ...options,
        onDownloadProgress: (progress) => {
          if (progress < 100) {
            toast.info(`Downloading proofreader model: ${Math.round(progress)}%`);
          }
        }
      });
      
      setProofreader(session);
      setAiProvider('chrome');
      return session;
    } catch (error) {
      console.error('Failed to initialize proofreader:', error);
      setAiProvider('openai');
      throw error;
    }
  }, []);

  /**
   * Proofread text and get corrections
   * Uses unified AI service with automatic fallback
   */
  const proofread = useCallback(async (text, options = {}) => {
    if (!text || text.trim().length === 0) {
      setCorrections([]);
      return { corrected: '', corrections: [] };
    }

    setIsProofreading(true);
    
    try {
      // Use unified service with fallback support
      const result = await unifiedProofread(text, options);
      
      // Detect which provider was used based on response structure
      if (result.corrections && Array.isArray(result.corrections)) {
        setAiProvider('chrome');
      } else {
        setAiProvider('openai');
      }
      
      setCorrections(result.corrections || []);
      
      return result;
    } catch (error) {
      console.error('Proofreading failed:', error);
      toast.error('Failed to proofread text. Please check your connection.');
      throw error;
    } finally {
      setIsProofreading(false);
    }
  }, []);

  /**
   * Check if text has errors
   */
  const hasErrors = useCallback((text) => {
    return corrections.length > 0;
  }, [corrections]);

  /**
   * Get correction for specific position
   */
  const getCorrectionAt = useCallback((position) => {
    return corrections.find(
      c => position >= c.startIndex && position <= c.endIndex
    );
  }, [corrections]);

  /**
   * Apply a specific correction
   */
  const applyCorrection = useCallback((text, correction) => {
    const before = text.substring(0, correction.startIndex);
    const after = text.substring(correction.endIndex);
    return before + correction.replacement + after;
  }, []);

  /**
   * Apply all corrections at once
   */
  const applyAllCorrections = useCallback((text) => {
    if (!corrections || corrections.length === 0) {
      return text;
    }

    // Apply corrections in reverse order to maintain correct indices
    let correctedText = text;
    const sortedCorrections = [...corrections].sort((a, b) => b.startIndex - a.startIndex);
    
    for (const correction of sortedCorrections) {
      correctedText = applyCorrection(correctedText, correction);
    }
    
    return correctedText;
  }, [corrections, applyCorrection]);

  /**
   * Group corrections by type
   */
  const getCorrectionsByType = useCallback(() => {
    const grouped = {};
    
    corrections.forEach(correction => {
      const type = correction.type || 'other';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(correction);
    });
    
    return grouped;
  }, [corrections]);

  /**
   * Get correction statistics
   */
  const getStats = useCallback(() => {
    const types = getCorrectionsByType();
    
    return {
      total: corrections.length,
      byType: Object.keys(types).reduce((acc, type) => {
        acc[type] = types[type].length;
        return acc;
      }, {}),
      hasErrors: corrections.length > 0
    };
  }, [corrections, getCorrectionsByType]);

  /**
   * Clear corrections
   */
  const clearCorrections = useCallback(() => {
    setCorrections([]);
  }, []);

  /**
   * Cleanup proofreader session
   */
  const cleanup = useCallback(() => {
    if (proofreader && proofreader.destroy) {
      proofreader.destroy();
    }
    setProofreader(null);
    setCorrections([]);
  }, [proofreader]);

  return {
    // State
    isProofreading,
    corrections,
    proofreader,
    aiProvider, // Added to track which AI service is being used
    
    // Functions
    proofread,
    initialize,
    hasErrors,
    getCorrectionAt,
    applyCorrection,
    applyAllCorrections,
    getCorrectionsByType,
    getStats,
    clearCorrections,
    cleanup
  };
};

export default useProofreader;
