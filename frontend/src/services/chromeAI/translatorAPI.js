import { checkAPIAvailability, withAIErrorHandling } from './baseAIService';

/**
 * Create a Translator instance
 * @param {string} sourceLanguage - Source language code (e.g., 'en')
 * @param {string} targetLanguage - Target language code (e.g., 'es')
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Translator instance
 */
export const createTranslator = async (sourceLanguage, targetLanguage, options = {}) => {
  const availability = await checkAPIAvailability('Translator');
  
  if (!availability.available) {
    throw new Error(availability.reason || 'Translator API not available');
  }

  // Check if language pair is supported
  const canTranslate = await self.translation.canTranslate({
    sourceLanguage,
    targetLanguage
  });

  if (canTranslate === 'no') {
    throw new Error(`Translation from ${sourceLanguage} to ${targetLanguage} is not available`);
  }

  const translator = await self.translation.createTranslator({
    sourceLanguage,
    targetLanguage
  });

  return translator;
};

/**
 * Translate text
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language code
 * @param {string} targetLanguage - Target language code
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} Translated text
 */
export const translateText = async (text, sourceLanguage, targetLanguage, options = {}) => {
  if (!text || text.trim().length === 0) {
    return text;
  }

  return withAIErrorHandling(async () => {
    const translator = await createTranslator(sourceLanguage, targetLanguage, options);
    const result = await translator.translate(text);
    
    // Clean up
    if (translator.destroy) {
      translator.destroy();
    }

    return result;
  }, 'Translator API');
};

/**
 * Translate text with streaming (for longer text)
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language code
 * @param {string} targetLanguage - Target language code
 * @param {Function} onChunk - Callback for each chunk
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} Complete translated text
 */
export const translateTextStreaming = async (text, sourceLanguage, targetLanguage, onChunk, options = {}) => {
  if (!text || text.trim().length === 0) {
    return text;
  }

  return withAIErrorHandling(async () => {
    const translator = await createTranslator(sourceLanguage, targetLanguage, options);
    const stream = translator.translateStreaming(text);

    let result = '';
    for await (const chunk of stream) {
      result += chunk;
      if (onChunk) {
        onChunk(result);
      }
    }
    
    // Clean up
    if (translator.destroy) {
      translator.destroy();
    }

    return result;
  }, 'Translator API');
};

/**
 * Check if a language pair is supported
 * @param {string} sourceLanguage - Source language code
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<boolean>} Whether the pair is supported
 */
export const isLanguagePairSupported = async (sourceLanguage, targetLanguage) => {
  try {
    if (!('Translator' in self)) {
      return false;
    }

    const availability = await Translator.availability({
      sourceLanguage,
      targetLanguage
    });

    return availability === 'available' || availability === 'readily';
  } catch (error) {
    console.error('Error checking language pair:', error);
    return false;
  }
};

/**
 * Common language codes and names
 */
export const SUPPORTED_LANGUAGES = {
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
  fi: 'Finnish'
};

/**
 * Get list of supported target languages for a source language
 * @param {string} sourceLanguage - Source language code
 * @returns {Promise<Array>} Array of {code, name} objects for supported targets
 */
export const getSupportedTargetLanguages = async (sourceLanguage) => {
  const languages = [];
  
  for (const [code, name] of Object.entries(SUPPORTED_LANGUAGES)) {
    if (code === sourceLanguage) continue;
    
    const isSupported = await isLanguagePairSupported(sourceLanguage, code);
    if (isSupported) {
      languages.push({ code, name });
    }
  }

  return languages;
};
