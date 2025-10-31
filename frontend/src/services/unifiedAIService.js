import { proofreadText as chromeProofread } from './chromeAI/proofreaderAPI';
import { rewriteText as chromeRewrite } from './chromeAI/rewriterAPI';
import { summarizeText as chromeSummarize } from './chromeAI/summarizerAPI';
import { generateInterviewQuestions as chromeInterviewQuestions, generateAnswerSuggestion as chromeAnswerSuggestion } from './chromeAI/promptAPI';
import {
  proofreadWithOpenAI,
  rewriteWithOpenAI,
  summarizeWithOpenAI,
  generateInterviewQuestionsWithOpenAI,
  generateAnswerSuggestionWithOpenAI
} from './openaiService';

/**
 * Check if Chrome AI is available
 */
const isChromeAIAvailable = async (apiName) => {
  try {
    if (apiName === 'Proofreader') {
      return typeof window.Proofreader !== 'undefined';
    } else if (apiName === 'Rewriter') {
      return typeof window.ai?.rewriter !== 'undefined';
    } else if (apiName === 'Summarizer') {
      return typeof window.ai?.summarizer !== 'undefined';
    } else if (apiName === 'LanguageModel') {
      return typeof window.ai?.languageModel !== 'undefined';
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Proofread text with fallback
 * Tries Chrome AI first, falls back to OpenAI
 */
export const proofread = async (text, options = {}) => {
  console.log('🤖 Proofreading text...');
  
  // Check if Chrome AI is available
  const chromeAvailable = await isChromeAIAvailable('Proofreader');
  
  if (chromeAvailable && !options.forceOpenAI) {
    try {
      console.log('✅ Using Chrome Proofreader API (free, on-device)');
      return await chromeProofread(text, options);
    } catch (error) {
      console.warn('⚠️ Chrome Proofreader failed, falling back to OpenAI:', error.message);
    }
  }
  
  // Fallback to OpenAI
  console.log('🌐 Using OpenAI API (cloud-based)');
  return await proofreadWithOpenAI(text);
};

/**
 * Rewrite text with fallback
 */
export const rewrite = async (text, options = {}) => {
  console.log('🤖 Rewriting text...');
  
  const chromeAvailable = await isChromeAIAvailable('Rewriter');
  
  if (chromeAvailable && !options.forceOpenAI) {
    try {
      console.log('✅ Using Chrome Rewriter API (free, on-device)');
      const result = await chromeRewrite(text, options);
      return typeof result === 'string' ? result : result.rewritten || result;
    } catch (error) {
      console.warn('⚠️ Chrome Rewriter failed, falling back to OpenAI:', error.message);
    }
  }
  
  console.log('🌐 Using OpenAI API (cloud-based)');
  return await rewriteWithOpenAI(text, options);
};

/**
 * Summarize text with fallback
 */
export const summarize = async (text, options = {}) => {
  console.log('🤖 Summarizing text...');
  
  const chromeAvailable = await isChromeAIAvailable('Summarizer');
  
  if (chromeAvailable && !options.forceOpenAI) {
    try {
      console.log('✅ Using Chrome Summarizer API (free, on-device)');
      const result = await chromeSummarize(text, options);
      return typeof result === 'string' ? result : result.summary || result;
    } catch (error) {
      console.warn('⚠️ Chrome Summarizer failed, falling back to OpenAI:', error.message);
    }
  }
  
  console.log('🌐 Using OpenAI API (cloud-based)');
  return await summarizeWithOpenAI(text, options);
};

/**
 * Generate interview questions with fallback
 */
export const generateInterviewQuestions = async (resumeData, count = 10) => {
  console.log('🤖 Generating interview questions...');
  
  const chromeAvailable = await isChromeAIAvailable('LanguageModel');
  
  if (chromeAvailable && !resumeData.forceOpenAI) {
    try {
      console.log('✅ Using Chrome Prompt API (free, on-device)');
      return await chromeInterviewQuestions(resumeData, count);
    } catch (error) {
      console.warn('⚠️ Chrome Prompt API failed, falling back to OpenAI:', error.message);
    }
  }
  
  console.log('🌐 Using OpenAI API (cloud-based)');
  return await generateInterviewQuestionsWithOpenAI({ ...resumeData, count });
};

/**
 * Generate answer suggestion with fallback
 */
export const generateAnswerSuggestion = async (question, resumeData) => {
  console.log('🤖 Generating answer suggestion...');
  
  const chromeAvailable = await isChromeAIAvailable('LanguageModel');
  
  if (chromeAvailable && !resumeData.forceOpenAI) {
    try {
      console.log('✅ Using Chrome Prompt API (free, on-device)');
      return await chromeAnswerSuggestion(question, resumeData);
    } catch (error) {
      console.warn('⚠️ Chrome Prompt API failed, falling back to OpenAI:', error.message);
    }
  }
  
  console.log('🌐 Using OpenAI API (cloud-based)');
  return await generateAnswerSuggestionWithOpenAI(question, resumeData);
};

/**
 * Get AI provider status
 */
export const getAIStatus = async () => {
  return {
    proofreader: await isChromeAIAvailable('Proofreader'),
    rewriter: await isChromeAIAvailable('Rewriter'),
    summarizer: await isChromeAIAvailable('Summarizer'),
    promptAPI: await isChromeAIAvailable('LanguageModel'),
    openAI: true // Always available (server-side)
  };
};

export default {
  proofread,
  rewrite,
  summarize,
  generateInterviewQuestions,
  generateAnswerSuggestion,
  getAIStatus
};
