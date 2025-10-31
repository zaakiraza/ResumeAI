import toast from 'react-hot-toast';

/**
 * Check if a Chrome AI API is available
 * @param {string} APIName - Name of the API (e.g., 'Writer', 'Rewriter', 'Proofreader')
 * @returns {Promise<{available: boolean, status: string, reason?: string}>}
 */
export const checkAPIAvailability = async (APIName) => {
  try {
    // Map API names to their location and method
    const apiMap = {
      'Writer': { base: 'global', method: 'Writer' }, // Global object
      'Rewriter': { base: 'ai', method: 'rewriter' },
      'Proofreader': { base: 'global', method: 'Proofreader' }, // Global object
      'Summarizer': { base: 'ai', method: 'summarizer' },
      'LanguageModel': { base: 'ai', method: 'languageModel' },
      'Translator': { base: 'translation', method: 'createTranslator' },
      'LanguageDetector': { base: 'translation', method: 'createDetector' }
    };
    
    const config = apiMap[APIName];
    if (!config) {
      return { 
        available: false, 
        status: 'not-supported',
        reason: `Unknown API: ${APIName}` 
      };
    }
    
    // Handle global APIs (like Writer, Proofreader)
    if (config.base === 'global') {
      const GlobalAPI = self[config.method];
      if (!GlobalAPI) {
        let instructions = `❌ ${APIName} API is not available in your browser.\n\n`;
        instructions += `📋 To enable:\n`;
        instructions += `1. ✅ Use Chrome Canary (v130+)\n`;
        
        if (config.method === 'Writer') {
          instructions += `2. 🔧 Enable chrome://flags/#writer-api-for-gemini-nano\n`;
        } else if (config.method === 'Proofreader') {
          instructions += `2. 🔧 Enable chrome://flags/#proofreader-api-for-gemini-nano\n`;
        }
        
        instructions += `3. 🔧 Enable chrome://flags/#optimization-guide-on-device-model\n`;
        instructions += `4. 🔄 Restart Chrome completely\n`;
        instructions += `5. 📥 Download model at chrome://components/\n`;
        instructions += `   (Look for "Optimization Guide On Device Model")\n\n`;
        
        return { 
          available: false, 
          status: 'not-supported',
          reason: instructions
        };
      }
      
      // Check availability for global API
      if (GlobalAPI.availability) {
        try {
          const availability = await GlobalAPI.availability();
          // availability can be: 'readily', 'available', 'after-download', or 'unavailable'
          return {
            available: availability !== 'unavailable',
            status: availability,
            reason: availability === 'unavailable' 
              ? `${APIName} API is not available on this device` 
              : undefined
          };
        } catch (error) {
          console.error(`Error checking ${APIName} availability:`, error);
          return {
            available: false,
            status: 'error',
            reason: error.message
          };
        }
      }
      
      return { available: true, status: 'readily' };
    }
    
    // Check if base API exists
    const baseAPI = self[config.base];
    if (!baseAPI) {
      let instructions = `❌ ${APIName} API is not available in your browser.\n\n`;
      
      if (config.base === 'ai') {
        instructions += `📋 To enable Chrome AI features:\n`;
        instructions += `1. ✅ Use Chrome Canary (v130+) - You have v144 ✓\n`;
        instructions += `2. 🔧 Enable these flags at chrome://flags/:\n`;
        instructions += `   • #optimization-guide-on-device-model\n`;
        instructions += `   • #prompt-api-for-gemini-nano\n`;
        instructions += `   • #${config.method}-api-for-gemini-nano\n`;
        instructions += `3. 🔄 Restart Chrome completely\n`;
        instructions += `4. 📥 Download model at chrome://components/\n`;
        instructions += `   (Look for "Optimization Guide On Device Model")\n`;
        instructions += `5. ⏳ Wait for download to complete (~1-2GB)\n\n`;
        instructions += `Note: These APIs are experimental and may not work on all devices.`;
      } else {
        instructions += `Enable chrome://flags/#translation-api and restart Chrome.`;
      }
      
      return { 
        available: false, 
        status: 'not-supported',
        reason: instructions
      };
    }
    
    // For translation API, check if method exists
    if (config.base === 'translation') {
      if (!baseAPI[config.method]) {
        return {
          available: false,
          status: 'not-supported',
          reason: `${APIName} is not available. Make sure chrome://flags/#translation-api is enabled.`
        };
      }
      return { available: true, status: 'readily' };
    }
    
    // For AI APIs, check availability
    const aiMethod = baseAPI[config.method];
    if (!aiMethod) {
      return { 
        available: false, 
        status: 'not-supported',
        reason: `${APIName} API is not available. Make sure chrome://flags/#${config.method}-api-for-gemini-nano is enabled.` 
      };
    }
    
    // Check availability
    const availability = await aiMethod.availability();
    
    return {
      available: availability === 'readily' || availability === 'after-download',
      status: availability,
      reason: availability === 'no' 
        ? `${APIName} API is not available on this device` 
        : undefined
    };
  } catch (error) {
    console.error(`Error checking ${APIName} availability:`, error);
    return {
      available: false,
      status: 'error',
      reason: error.message
    };
  }
};

/**
 * Handle AI API errors with user-friendly messages
 * @param {Error} error - The error object
 * @param {string} apiName - Name of the API that failed
 * @returns {void}
 */
export const handleAIError = (error, apiName) => {
  console.error(`${apiName} Error:`, error);
  
  if (error.name === 'NotSupportedError') {
    toast.error(`${apiName} is not available in your browser. Please use Chrome Canary with the required flags enabled.`);
  } else if (error.name === 'QuotaExceededError') {
    toast.error('AI quota exceeded. Please try again later.');
  } else if (error.name === 'AbortError') {
    toast.info('AI operation cancelled');
  } else if (error.message?.includes('after-download')) {
    toast.warning('AI model is downloading. Please wait a few minutes and try again.');
  } else {
    toast.error(`AI feature temporarily unavailable: ${error.message}`);
  }
};

/**
 * Wrapper for AI operations with error handling
 * @param {Function} apiCall - The API function to call
 * @param {string} apiName - Name of the API
 * @param {string} fallbackMessage - Custom error message
 * @returns {Promise<any>}
 */
export const withAIErrorHandling = async (apiCall, apiName, fallbackMessage) => {
  try {
    return await apiCall();
  } catch (error) {
    handleAIError(error, apiName);
    return null;
  }
};

/**
 * Create a debounced function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function}
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
