import { checkAPIAvailability, withAIErrorHandling } from './baseAIService';

/**
 * Create a Summarizer instance
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Summarizer instance
 */
export const createSummarizer = async (options = {}) => {
  const availability = await checkAPIAvailability('Summarizer');
  
  if (!availability.available) {
    throw new Error(availability.reason || 'Summarizer API not available');
  }

  const summarizer = await self.ai.summarizer.create({
    type: options.type || 'key-points', // 'key-points', 'tldr', 'teaser', 'headline'
    format: options.format || 'plain-text', // 'markdown', 'plain-text'
    length: options.length || 'medium', // 'short', 'medium', 'long'
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

  return summarizer;
};

/**
 * Summarize text
 * @param {string} text - Text to summarize
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} Summarized text
 */
export const summarizeText = async (text, options = {}) => {
  if (!text || text.trim().length === 0) {
    return text;
  }

  return withAIErrorHandling(async () => {
    const summarizer = await createSummarizer(options);
    const result = await summarizer.summarize(text, {
      context: options.context || ''
    });
    
    // Clean up
    if (summarizer.destroy) {
      summarizer.destroy();
    }

    return result;
  }, 'Summarizer API');
};

/**
 * Summarize text with streaming (for longer text)
 * @param {string} text - Text to summarize
 * @param {Object} options - Configuration options
 * @param {Function} onChunk - Callback for each chunk
 * @returns {Promise<string>} Complete summarized text
 */
export const summarizeTextStreaming = async (text, options = {}, onChunk) => {
  if (!text || text.trim().length === 0) {
    return text;
  }

  return withAIErrorHandling(async () => {
    const summarizer = await createSummarizer(options);
    const stream = summarizer.summarizeStreaming(text, {
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
    if (summarizer.destroy) {
      summarizer.destroy();
    }

    return result;
  }, 'Summarizer API');
};

/**
 * Generate key points from text
 * @param {string} text - Text to extract key points from
 * @param {string} length - 'short' (3), 'medium' (5), 'long' (7) bullet points
 * @returns {Promise<string>} Key points in markdown format
 */
export const generateKeyPoints = async (text, length = 'medium') => {
  return summarizeText(text, {
    type: 'key-points',
    format: 'markdown',
    length: length
  });
};

/**
 * Generate TL;DR summary
 * @param {string} text - Text to summarize
 * @param {string} length - 'short' (1), 'medium' (3), 'long' (5) sentences
 * @returns {Promise<string>} TL;DR summary
 */
export const generateTLDR = async (text, length = 'short') => {
  return summarizeText(text, {
    type: 'tldr',
    format: 'plain-text',
    length: length
  });
};

/**
 * Generate headline from text
 * @param {string} text - Text to create headline from
 * @param {string} length - 'short' (12), 'medium' (17), 'long' (22) words
 * @returns {Promise<string>} Headline
 */
export const generateHeadline = async (text, length = 'medium') => {
  return summarizeText(text, {
    type: 'headline',
    format: 'plain-text',
    length: length
  });
};

/**
 * Generate teaser from text
 * @param {string} text - Text to create teaser from
 * @param {string} length - 'short' (1), 'medium' (3), 'long' (5) sentences
 * @returns {Promise<string>} Teaser text
 */
export const generateTeaser = async (text, length = 'short') => {
  return summarizeText(text, {
    type: 'teaser',
    format: 'plain-text',
    length: length
  });
};

/**
 * Summarize job responsibilities into bullet points
 * @param {string} responsibilities - Long job responsibilities text
 * @returns {Promise<string>} Bullet points in markdown
 */
export const summarizeResponsibilities = async (responsibilities) => {
  return generateKeyPoints(responsibilities, 'medium');
};
