import { useState, useCallback } from 'react';
import {
  detectLanguage,
  getMostLikelyLanguage,
  isLanguage,
  detectNonEnglish,
  getLanguageName,
  formatDetectionResults
} from '../services/chromeAI/languageDetectorAPI';
import { toast } from 'react-toastify';

/**
 * React hook for using the Language Detector API
 * @returns {Object} Language Detector functions and state
 */
const useLanguageDetector = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLanguages, setDetectedLanguages] = useState([]);
  const [primaryLanguage, setPrimaryLanguage] = useState(null);

  /**
   * Detect language(s) in text
   * @param {string} text - Text to analyze
   * @returns {Promise<Array>} Array of detected languages with confidence
   */
  const detect = useCallback(async (text) => {
    if (!text || text.trim().length === 0) {
      setDetectedLanguages([]);
      setPrimaryLanguage(null);
      return [];
    }

    if (text.trim().length < 10) {
      toast.warning('Text too short for reliable language detection');
      return [];
    }

    setIsDetecting(true);
    
    try {
      const results = await detectLanguage(text, {
        onDownloadProgress: (progress) => {
          if (progress < 100) {
            toast.info(`Downloading language detector: ${Math.round(progress)}%`);
          }
        }
      });

      setDetectedLanguages(results);
      
      if (results.length > 0) {
        setPrimaryLanguage(results[0]);
      }
      
      return results;
    } catch (error) {
      console.error('Language detection failed:', error);
      toast.error('Failed to detect language');
      throw error;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  /**
   * Get the most likely language
   * @param {string} text - Text to analyze
   * @param {number} minConfidence - Minimum confidence threshold
   * @returns {Promise<Object|null>} Primary language or null
   */
  const detectPrimary = useCallback(async (text, minConfidence = 0.5) => {
    setIsDetecting(true);
    
    try {
      const result = await getMostLikelyLanguage(text, minConfidence);
      
      if (result) {
        setPrimaryLanguage(result);
      }
      
      return result;
    } catch (error) {
      console.error('Primary language detection failed:', error);
      toast.error('Failed to detect language');
      throw error;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  /**
   * Check if text is in specific language
   * @param {string} text - Text to check
   * @param {string} expectedLang - Expected language code
   * @param {number} minConfidence - Minimum confidence threshold
   * @returns {Promise<boolean>} Whether text matches expected language
   */
  const checkLanguage = useCallback(async (text, expectedLang, minConfidence = 0.7) => {
    setIsDetecting(true);
    
    try {
      const result = await isLanguage(text, expectedLang, minConfidence);
      return result;
    } catch (error) {
      console.error('Language check failed:', error);
      return false;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  /**
   * Detect if text is NOT in English
   * @param {string} text - Text to check
   * @returns {Promise<Object|null>} Non-English language info or null
   */
  const detectNonEnglishLanguage = useCallback(async (text) => {
    setIsDetecting(true);
    
    try {
      const result = await detectNonEnglish(text);
      return result;
    } catch (error) {
      console.error('Non-English detection failed:', error);
      return null;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  /**
   * Get formatted detection results
   * @param {number} maxResults - Maximum results to return
   * @returns {Array} Formatted results with language names
   */
  const getFormattedResults = useCallback((maxResults = 3) => {
    return formatDetectionResults(detectedLanguages, maxResults);
  }, [detectedLanguages]);

  /**
   * Get language name from code
   * @param {string} code - Language code
   * @returns {string} Language name
   */
  const getLanguageNameFromCode = useCallback((code) => {
    return getLanguageName(code);
  }, []);

  /**
   * Auto-detect and suggest translation
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} Detection result with translation suggestion
   */
  const detectAndSuggestTranslation = useCallback(async (text) => {
    const result = await detectPrimary(text);
    
    if (!result || result.language === 'en') {
      return {
        needsTranslation: false,
        detectedLanguage: result?.language || 'en'
      };
    }
    
    return {
      needsTranslation: true,
      detectedLanguage: result.language,
      languageName: getLanguageName(result.language),
      confidence: result.confidence,
      suggestion: `Translate from ${getLanguageName(result.language)} to English?`
    };
  }, [detectPrimary]);

  /**
   * Detect resume language
   * @param {Object} resumeData - Resume data object
   * @returns {Promise<Object>} Language detection for resume
   */
  const detectResumeLanguage = useCallback(async (resumeData) => {
    // Combine key text fields
    const textToAnalyze = [
      resumeData.careerObjective,
      resumeData.personalInfo?.name,
      ...(resumeData.workExperience || []).map(exp => exp.responsibilities).filter(Boolean),
      ...(resumeData.education || []).map(edu => edu.degree).filter(Boolean)
    ].filter(Boolean).join(' ');

    if (!textToAnalyze || textToAnalyze.trim().length < 10) {
      return null;
    }

    return detectPrimary(textToAnalyze);
  }, [detectPrimary]);

  /**
   * Clear detection results
   */
  const clear = useCallback(() => {
    setDetectedLanguages([]);
    setPrimaryLanguage(null);
  }, []);

  return {
    // State
    isDetecting,
    detectedLanguages,
    primaryLanguage,
    
    // Core functions
    detect,
    detectPrimary,
    checkLanguage,
    detectNonEnglishLanguage,
    
    // Utilities
    getFormattedResults,
    getLanguageNameFromCode,
    detectAndSuggestTranslation,
    
    // Resume-specific
    detectResumeLanguage,
    
    // Clear
    clear
  };
};

export default useLanguageDetector;
