import { checkAPIAvailability, withAIErrorHandling } from './baseAIService';

/**
 * Create a Proofreader instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Proofreader instance
 */
export const createProofreader = async (options = {}) => {
  try {
    console.log('Checking Proofreader availability...');
    const availability = await checkAPIAvailability('Proofreader');
    
    console.log('Proofreader availability:', availability);
    
    if (!availability.available) {
      throw new Error(availability.reason || 'Proofreader API not available');
    }

    // If model needs download, inform user
    if (availability.status === 'after-download') {
      console.log('Model needs to be downloaded...');
      if (options.onDownloadStart) {
        options.onDownloadStart();
      }
    }

    console.log('Creating Proofreader instance...');
    // Use global Proofreader object (not window.ai.proofreader)
    const proofreader = await Proofreader.create({
      expectedInputLanguages: options.expectedInputLanguages || ['en'],
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          console.log(`Download progress: ${(e.loaded * 100).toFixed(1)}%`);
          if (options.onDownloadProgress) {
            options.onDownloadProgress(e.loaded * 100);
          }
        });
      }
    });

    console.log('Proofreader created successfully');
    return proofreader;
  } catch (error) {
    console.error('Failed to create proofreader:', error);
    throw error;
  }
};

/**
 * Proofread text and get corrections
 * @param {string} text - Text to proofread
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Proofread result with corrections
 */
export const proofreadText = async (text, options = {}) => {
  if (!text || text.trim().length === 0) {
    return { corrected: '', corrections: [] };
  }

  return withAIErrorHandling(async () => {
    console.log('Starting proofread for text length:', text.length);
    const startTime = Date.now();
    
    const proofreader = await createProofreader(options);
    const createTime = Date.now() - startTime;
    console.log(`Proofreader created in ${createTime}ms`);
    
    console.log('Calling proofread()...');
    const proofreadStart = Date.now();
    const result = await proofreader.proofread(text);
    const proofreadTime = Date.now() - proofreadStart;
    console.log(`Proofread completed in ${proofreadTime}ms`);
    console.log('Result:', result);
    
    // Clean up
    if (proofreader.destroy) {
      proofreader.destroy();
    }

    const totalTime = Date.now() - startTime;
    console.log(`Total time: ${totalTime}ms`);

    return {
      corrected: result.corrected || text,
      corrections: result.corrections || [],
      hasErrors: result.corrections && result.corrections.length > 0
    };
  }, 'Proofreader API');
};

/**
 * Apply a single correction to text
 * @param {string} text - Original text
 * @param {Object} correction - Correction object with startIndex, endIndex, and replacement
 * @returns {string} Text with correction applied
 */
export const applySingleCorrection = (text, correction) => {
  const before = text.substring(0, correction.startIndex);
  const after = text.substring(correction.endIndex);
  return before + correction.replacement + after;
};

/**
 * Apply all corrections to text
 * @param {string} text - Original text
 * @param {Array} corrections - Array of correction objects
 * @returns {string} Text with all corrections applied
 */
export const applyAllCorrections = (text, corrections) => {
  if (!corrections || corrections.length === 0) {
    return text;
  }

  // Sort corrections by startIndex in descending order to avoid index shifts
  const sortedCorrections = [...corrections].sort((a, b) => b.startIndex - a.startIndex);
  
  let correctedText = text;
  for (const correction of sortedCorrections) {
    correctedText = applySingleCorrection(correctedText, correction);
  }

  return correctedText;
};

/**
 * Format correction for display
 * @param {Object} correction - Correction object
 * @returns {Object} Formatted correction with user-friendly information
 */
export const formatCorrection = (correction) => {
  return {
    ...correction,
    errorType: correction.type || 'unknown',
    suggestion: correction.replacement || '',
    explanation: correction.explanation || 'Correction suggested',
    range: {
      start: correction.startIndex,
      end: correction.endIndex
    }
  };
};
