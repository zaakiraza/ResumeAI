import { checkAPIAvailability, withAIErrorHandling } from './baseAIService';

/**
 * Create a Language Detector instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Language Detector instance
 */
export const createLanguageDetector = async (options = {}) => {
  const availability = await checkAPIAvailability('LanguageDetector');
  
  if (!availability.available) {
    throw new Error(availability.reason || 'Language Detector API not available');
  }

  const detector = await self.translation.createDetector();

  return detector;
};

/**
 * Detect language of text
 * @param {string} text - Text to detect language from
 * @param {Object} options - Configuration options
 * @returns {Promise<Array>} Array of detected languages with confidence scores
 */
export const detectLanguage = async (text, options = {}) => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Very short text is unreliable
  if (text.trim().length < 10) {
    console.warn('Text too short for reliable language detection');
  }

  return withAIErrorHandling(async () => {
    const detector = await createLanguageDetector(options);
    const results = await detector.detect(text);
    
    // Clean up
    if (detector.destroy) {
      detector.destroy();
    }

    return results.map(result => ({
      language: result.detectedLanguage,
      confidence: result.confidence,
      percentage: Math.round(result.confidence * 100)
    }));
  }, 'Language Detector API');
};

/**
 * Get the most likely language
 * @param {string} text - Text to detect language from
 * @param {number} minConfidence - Minimum confidence threshold (0-1)
 * @returns {Promise<Object|null>} Most likely language or null if below threshold
 */
export const getMostLikelyLanguage = async (text, minConfidence = 0.5) => {
  const results = await detectLanguage(text);
  
  if (!results || results.length === 0) {
    return null;
  }

  const topResult = results[0];
  
  if (topResult.confidence < minConfidence) {
    console.warn(`Language detection confidence too low: ${topResult.confidence}`);
    return null;
  }

  return topResult;
};

/**
 * Check if text is in a specific language
 * @param {string} text - Text to check
 * @param {string} expectedLanguage - Expected language code (e.g., 'en')
 * @param {number} minConfidence - Minimum confidence threshold
 * @returns {Promise<boolean>} Whether text is in the expected language
 */
export const isLanguage = async (text, expectedLanguage, minConfidence = 0.7) => {
  const result = await getMostLikelyLanguage(text, minConfidence);
  
  if (!result) {
    return false;
  }

  return result.language === expectedLanguage;
};

/**
 * Detect if text is NOT in English
 * @param {string} text - Text to check
 * @param {number} minConfidence - Minimum confidence threshold
 * @returns {Promise<Object|null>} Detected language info if not English, null otherwise
 */
export const detectNonEnglish = async (text, minConfidence = 0.7) => {
  const result = await getMostLikelyLanguage(text, minConfidence);
  
  if (!result || result.language === 'en') {
    return null;
  }

  return result;
};

/**
 * Language code to name mapping
 */
const LANGUAGE_NAMES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  pl: 'Polish',
  ru: 'Russian',
  ja: 'Japanese',
  zh: 'Chinese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
  tr: 'Turkish',
  vi: 'Vietnamese',
  th: 'Thai',
  id: 'Indonesian',
  sv: 'Swedish',
  no: 'Norwegian',
  da: 'Danish',
  fi: 'Finnish',
  cs: 'Czech',
  el: 'Greek',
  he: 'Hebrew',
  hu: 'Hungarian',
  ro: 'Romanian',
  uk: 'Ukrainian'
};

/**
 * Get language name from code
 * @param {string} code - Language code
 * @returns {string} Language name
 */
export const getLanguageName = (code) => {
  return LANGUAGE_NAMES[code] || code.toUpperCase();
};

/**
 * Format detection results for display
 * @param {Array} results - Detection results
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Array} Formatted results with names
 */
export const formatDetectionResults = (results, maxResults = 3) => {
  if (!results || results.length === 0) {
    return [];
  }

  return results
    .slice(0, maxResults)
    .map(result => ({
      ...result,
      name: getLanguageName(result.language),
      confidencePercent: `${result.percentage}%`
    }));
};
