import { useState, useCallback } from 'react';
import { createTranslator, translateText } from '../services/chromeAI/translatorAPI';
import { toast } from 'react-toastify';

/**
 * React hook for using the Translator API
 * @returns {Object} Translator functions and state
 */
const useTranslator = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');

  /**
   * Translate text
   * @param {string} text - Text to translate
   * @param {string} source - Source language code
   * @param {string} target - Target language code
   * @returns {Promise<string>} Translated text
   */
  const translate = useCallback(async (text, source, target) => {
    if (!text || text.trim().length === 0) {
      return '';
    }

    setIsTranslating(true);
    setTranslatedText('');
    
    try {
      const translator = await createTranslator(source || sourceLanguage, target || targetLanguage, {
        onDownloadProgress: (progress) => {
          if (progress < 100) {
            toast.info(`Downloading translation model: ${Math.round(progress)}%`);
          }
        }
      });

      const result = await translateText(translator, text);
      setTranslatedText(result);
      
      // Cleanup
      if (translator.destroy) {
        translator.destroy();
      }
      
      return result;
    } catch (error) {
      console.error('Translation failed:', error);
      toast.error('Failed to translate text');
      throw error;
    } finally {
      setIsTranslating(false);
    }
  }, [sourceLanguage, targetLanguage]);

  /**
   * Set source language
   */
  const setSource = useCallback((lang) => {
    setSourceLanguage(lang);
  }, []);

  /**
   * Set target language
   */
  const setTarget = useCallback((lang) => {
    setTargetLanguage(lang);
  }, []);

  /**
   * Swap source and target languages
   */
  const swapLanguages = useCallback(() => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
  }, [sourceLanguage, targetLanguage]);

  /**
   * Translate to Spanish
   */
  const toSpanish = useCallback(async (text, source = 'en') => {
    return translate(text, source, 'es');
  }, [translate]);

  /**
   * Translate to English
   */
  const toEnglish = useCallback(async (text, source = 'es') => {
    return translate(text, source, 'en');
  }, [translate]);

  /**
   * Translate to Japanese
   */
  const toJapanese = useCallback(async (text, source = 'en') => {
    return translate(text, source, 'ja');
  }, [translate]);

  /**
   * Translate entire resume
   */
  const translateResume = useCallback(async (resumeData, targetLang) => {
    setIsTranslating(true);
    
    try {
      const translatedResume = {};
      
      // Translate each text field
      for (const [key, value] of Object.entries(resumeData)) {
        if (typeof value === 'string' && value.trim().length > 0) {
          translatedResume[key] = await translate(value, sourceLanguage, targetLang);
        } else if (Array.isArray(value)) {
          // Handle arrays (like work experience, education)
          translatedResume[key] = await Promise.all(
            value.map(async (item) => {
              const translatedItem = {};
              for (const [itemKey, itemValue] of Object.entries(item)) {
                if (typeof itemValue === 'string' && itemValue.trim().length > 0) {
                  translatedItem[itemKey] = await translate(itemValue, sourceLanguage, targetLang);
                } else {
                  translatedItem[itemKey] = itemValue;
                }
              }
              return translatedItem;
            })
          );
        } else {
          translatedResume[key] = value;
        }
      }
      
      return translatedResume;
    } catch (error) {
      console.error('Resume translation failed:', error);
      toast.error('Failed to translate resume');
      throw error;
    } finally {
      setIsTranslating(false);
    }
  }, [translate, sourceLanguage]);

  /**
   * Clear translation
   */
  const clear = useCallback(() => {
    setTranslatedText('');
  }, []);

  return {
    // State
    isTranslating,
    translatedText,
    sourceLanguage,
    targetLanguage,
    
    // Core functions
    translate,
    setSource,
    setTarget,
    swapLanguages,
    
    // Convenience functions
    toSpanish,
    toEnglish,
    toJapanese,
    
    // Resume-specific
    translateResume,
    
    // Utilities
    clear
  };
};

export default useTranslator;
