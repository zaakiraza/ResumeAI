import { useState, useCallback } from 'react';
import { rewrite as unifiedRewrite } from '../services/unifiedAIService';
import { createRewriter, rewriteTextStreaming } from '../services/chromeAI/rewriterAPI';
import { toast } from 'react-toastify';

/**
 * React hook for using the Rewriter API with fallback
 * Uses Chrome AI when available, falls back to OpenAI
 * @returns {Object} Rewriter functions and state
 */
const useRewriter = () => {
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenText, setRewrittenText] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [aiProvider, setAiProvider] = useState(null); // 'chrome' or 'openai'

  /**
   * Rewrite text with options (uses unified service with fallback)
   * @param {string} text - Text to rewrite
   * @param {Object} options - Rewriting options
   * @returns {Promise<string>} Rewritten text
   */
  const rewrite = useCallback(async (text, options = {}) => {
    if (!text || text.trim().length === 0) {
      return '';
    }

    setIsRewriting(true);
    setRewrittenText('');
    
    try {
      // Use unified service with automatic fallback
      const result = await unifiedRewrite(text, options);
      
      // Result is a string from unified service
      const rewrittenResult = typeof result === 'string' ? result : result.rewritten || result.text || '';
      
      // Detect provider (Chrome AI typically faster, OpenAI has more structured response)
      if (typeof result === 'string' && result.length > 0) {
        // Simple string response typically from Chrome AI
        setAiProvider('chrome');
      } else {
        setAiProvider('openai');
      }
      
      setRewrittenText(rewrittenResult);
      return rewrittenResult;
    } catch (error) {
      console.error('Rewriting failed:', error);
      toast.error('Failed to rewrite text. Please check your connection.');
      throw error;
    } finally {
      setIsRewriting(false);
    }
  }, []);

  /**
   * Rewrite text with streaming (real-time updates)
   * Note: Streaming only works with Chrome AI
   */
  const rewriteStreaming = useCallback(async (text, options = {}, onChunk) => {
    if (!text || text.trim().length === 0) {
      return '';
    }

    setIsRewriting(true);
    setStreamingText('');
    setAiProvider('chrome');
    let fullText = '';
    
    try {
      const rewriter = await createRewriter({
        ...options,
        onDownloadProgress: (progress) => {
          if (progress < 100) {
            toast.info(`Downloading rewriter model: ${Math.round(progress)}%`);
          }
        }
      });

      const stream = await rewriteTextStreaming(rewriter, text, options.context);
      
      for await (const chunk of stream) {
        fullText = chunk;
        setStreamingText(chunk);
        if (onChunk) {
          onChunk(chunk);
        }
      }
      
      setRewrittenText(fullText);
      
      // Cleanup
      if (rewriter.destroy) {
        rewriter.destroy();
      }
      
      return fullText;
    } catch (error) {
      console.error('Streaming rewrite failed (falling back to unified service):', error);
      // Fall back to non-streaming unified service
      return rewrite(text, options);
    } finally {
      setIsRewriting(false);
    }
  }, [rewrite]);

  /**
   * Make text more formal
   */
  const makeFormal = useCallback(async (text, context) => {
    return rewrite(text, {
      tone: 'more-formal',
      context
    });
  }, [rewrite]);

  /**
   * Make text more casual
   */
  const makeCasual = useCallback(async (text, context) => {
    return rewrite(text, {
      tone: 'more-casual',
      context
    });
  }, [rewrite]);

  /**
   * Make text shorter
   */
  const shorten = useCallback(async (text, context) => {
    return rewrite(text, {
      length: 'shorter',
      context
    });
  }, [rewrite]);

  /**
   * Make text longer
   */
  const expand = useCallback(async (text, context) => {
    return rewrite(text, {
      length: 'longer',
      context
    });
  }, [rewrite]);

  /**
   * Convert to markdown format
   */
  const toMarkdown = useCallback(async (text, context) => {
    return rewrite(text, {
      format: 'markdown',
      context
    });
  }, [rewrite]);

  /**
   * Convert to plain text
   */
  const toPlainText = useCallback(async (text, context) => {
    return rewrite(text, {
      format: 'plain-text',
      context
    });
  }, [rewrite]);

  /**
   * Professional rewrite (formal + concise)
   */
  const makeProfessional = useCallback(async (text, context) => {
    return rewrite(text, {
      tone: 'more-formal',
      length: 'as-is',
      context: context || 'Professional resume content'
    });
  }, [rewrite]);

  /**
   * Improve clarity (neutral tone + concise)
   */
  const improveClarity = useCallback(async (text, context) => {
    return rewrite(text, {
      tone: 'as-is',
      length: 'shorter',
      context: context || 'Make this clearer and more concise'
    });
  }, [rewrite]);

  /**
   * Clear rewritten text
   */
  const clear = useCallback(() => {
    setRewrittenText('');
    setStreamingText('');
  }, []);

  return {
    // State
    isRewriting,
    rewrittenText,
    streamingText,
    aiProvider, // Added to track which AI service is being used
    
    // Core functions
    rewrite,
    rewriteStreaming,
    
    // Convenience functions
    makeFormal,
    makeCasual,
    shorten,
    expand,
    toMarkdown,
    toPlainText,
    makeProfessional,
    improveClarity,
    
    // Utilities
    clear
  };
};

export default useRewriter;
