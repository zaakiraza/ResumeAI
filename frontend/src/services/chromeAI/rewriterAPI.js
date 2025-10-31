import { checkAPIAvailability, withAIErrorHandling } from './baseAIService';

/**
 * Create a Rewriter instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Rewriter instance
 */
export const createRewriter = async (options = {}) => {
  const availability = await checkAPIAvailability('Rewriter');
  
  if (!availability.available) {
    throw new Error(availability.reason || 'Rewriter API not available');
  }

  const rewriter = await self.ai.rewriter.create({
    tone: options.tone || 'as-is', // 'more-formal', 'as-is', 'more-casual'
    format: options.format || 'plain-text', // 'as-is', 'markdown', 'plain-text'
    length: options.length || 'as-is', // 'shorter', 'as-is', 'longer'
    sharedContext: options.sharedContext || '',
    expectedInputLanguages: options.expectedInputLanguages || ['en'],
    expectedContextLanguages: options.expectedContextLanguages || ['en'],
    outputLanguage: options.outputLanguage || 'en',
    monitor(m) {
      if (options.onDownloadProgress) {
        m.addEventListener('downloadprogress', (e) => {
          options.onDownloadProgress(e.loaded * 100);
        });
      }
    }
  });

  return rewriter;
};

/**
 * Rewrite text with specified options
 * @param {string} text - Text to rewrite
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} Rewritten text
 */
export const rewriteText = async (text, options = {}) => {
  if (!text || text.trim().length === 0) {
    return text;
  }

  return withAIErrorHandling(async () => {
    const rewriter = await createRewriter(options);
    const result = await rewriter.rewrite(text, {
      context: options.context || ''
    });
    
    // Clean up
    if (rewriter.destroy) {
      rewriter.destroy();
    }

    return result;
  }, 'Rewriter API');
};

/**
 * Rewrite text with streaming (for longer text)
 * @param {string} text - Text to rewrite
 * @param {Object} options - Configuration options
 * @param {Function} onChunk - Callback for each chunk
 * @returns {Promise<string>} Complete rewritten text
 */
export const rewriteTextStreaming = async (text, options = {}, onChunk) => {
  if (!text || text.trim().length === 0) {
    return text;
  }

  return withAIErrorHandling(async () => {
    const rewriter = await createRewriter(options);
    const stream = rewriter.rewriteStreaming(text, {
      context: options.context || ''
    });

    let result = '';
    for await (const chunk of stream) {
      result += chunk;
      if (onChunk) {
        onChunk(result);
      }
    }
    
    // Clean up
    if (rewriter.destroy) {
      rewriter.destroy();
    }

    return result;
  }, 'Rewriter API');
};

/**
 * Make text more formal
 * @param {string} text - Text to rewrite
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Formalized text
 */
export const makeFormal = async (text, options = {}) => {
  return rewriteText(text, {
    ...options,
    tone: 'more-formal'
  });
};

/**
 * Make text more casual
 * @param {string} text - Text to rewrite
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Casualized text
 */
export const makeCasual = async (text, options = {}) => {
  return rewriteText(text, {
    ...options,
    tone: 'more-casual'
  });
};

/**
 * Make text shorter
 * @param {string} text - Text to rewrite
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Shortened text
 */
export const makeShorter = async (text, options = {}) => {
  return rewriteText(text, {
    ...options,
    length: 'shorter'
  });
};

/**
 * Make text longer
 * @param {string} text - Text to rewrite
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Lengthened text
 */
export const makeLonger = async (text, options = {}) => {
  return rewriteText(text, {
    ...options,
    length: 'longer'
  });
};

/**
 * Refine text for professional resume content
 * @param {string} text - Text to refine
 * @param {string} jobTitle - Job title for context
 * @returns {Promise<string>} Refined text
 */
export const refineForResume = async (text, jobTitle = '') => {
  return rewriteText(text, {
    tone: 'more-formal',
    format: 'plain-text',
    length: 'as-is',
    sharedContext: 'Professional resume content',
    context: jobTitle ? `Professional resume content for ${jobTitle}` : 'Professional resume content'
  });
};
