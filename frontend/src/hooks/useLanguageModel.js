import { useState, useCallback } from 'react';
import { createLanguageModel, promptModel, promptModelStreaming } from '../services/chromeAI/promptAPI';
import { toast } from 'react-toastify';

/**
 * React hook for using the Prompt API (Language Model)
 * @returns {Object} Language Model functions and state
 */
const useLanguageModel = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState('');
  const [streamingResponse, setStreamingResponse] = useState('');
  const [session, setSession] = useState(null);

  /**
   * Initialize language model session
   */
  const initialize = useCallback(async (options = {}) => {
    try {
      const model = await createLanguageModel({
        ...options,
        onDownloadProgress: (progress) => {
          if (progress < 100) {
            toast.info(`Downloading language model: ${Math.round(progress)}%`);
          }
        }
      });
      
      setSession(model);
      return model;
    } catch (error) {
      console.error('Failed to initialize language model:', error);
      throw error;
    }
  }, []);

  /**
   * Send prompt to language model
   */
  const prompt = useCallback(async (text, options = {}) => {
    if (!text || text.trim().length === 0) {
      return '';
    }

    setIsProcessing(true);
    setResponse('');
    
    try {
      let model = session;
      
      // Create session if not exists
      if (!model) {
        model = await initialize(options);
      }

      const result = await promptModel(model, text, options.context);
      setResponse(result);
      
      return result;
    } catch (error) {
      console.error('Prompt failed:', error);
      toast.error('Failed to process prompt');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [session, initialize]);

  /**
   * Send prompt with streaming response
   */
  const promptStreaming = useCallback(async (text, options = {}, onChunk) => {
    if (!text || text.trim().length === 0) {
      return '';
    }

    setIsProcessing(true);
    setStreamingResponse('');
    let fullResponse = '';
    
    try {
      let model = session;
      
      if (!model) {
        model = await initialize(options);
      }

      const stream = await promptModelStreaming(model, text, options.context);
      
      for await (const chunk of stream) {
        fullResponse = chunk;
        setStreamingResponse(chunk);
        if (onChunk) {
          onChunk(chunk);
        }
      }
      
      setResponse(fullResponse);
      
      return fullResponse;
    } catch (error) {
      console.error('Streaming prompt failed:', error);
      toast.error('Failed to process prompt');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [session, initialize]);

  /**
   * Generate interview questions based on resume
   */
  const generateInterviewQuestions = useCallback(async (resumeData, jobRole) => {
    const promptText = `Based on this resume for a ${jobRole} position, generate 10 relevant interview questions:\n\nExperience: ${resumeData.experience}\nSkills: ${resumeData.skills}\nEducation: ${resumeData.education}`;
    
    return prompt(promptText, {
      context: 'Generate professional interview questions',
      temperature: 0.8
    });
  }, [prompt]);

  /**
   * Improve resume section with AI suggestions
   */
  const improveResumeSection = useCallback(async (sectionName, content) => {
    const promptText = `Improve this ${sectionName} section for a professional resume:\n\n${content}`;
    
    return prompt(promptText, {
      context: 'Provide professional resume improvement suggestions',
      temperature: 0.7
    });
  }, [prompt]);

  /**
   * Generate cover letter
   */
  const generateCoverLetter = useCallback(async (resumeData, jobDescription, companyName) => {
    const promptText = `Write a professional cover letter for ${companyName}.\n\nJob Description: ${jobDescription}\n\nMy Background:\n${resumeData}`;
    
    return promptStreaming(promptText, {
      context: 'Write a compelling cover letter',
      temperature: 0.8
    });
  }, [promptStreaming]);

  /**
   * Suggest skills to add
   */
  const suggestSkills = useCallback(async (currentSkills, targetRole) => {
    const promptText = `I currently have these skills: ${currentSkills}\n\nWhat additional skills should I learn for a ${targetRole} role?`;
    
    return prompt(promptText, {
      context: 'Suggest relevant skills for career growth',
      temperature: 0.7
    });
  }, [prompt]);

  /**
   * Analyze resume and provide feedback
   */
  const analyzeResume = useCallback(async (resumeContent) => {
    const promptText = `Analyze this resume and provide constructive feedback:\n\n${resumeContent}`;
    
    return prompt(promptText, {
      context: 'Provide professional resume feedback',
      temperature: 0.7
    });
  }, [prompt]);

  /**
   * Generate achievement statements
   */
  const generateAchievements = useCallback(async (jobTitle, responsibilities) => {
    const promptText = `For a ${jobTitle} role with these responsibilities:\n${responsibilities}\n\nGenerate 5 achievement-focused bullet points using action verbs and quantifiable results.`;
    
    return prompt(promptText, {
      context: 'Generate professional achievement statements',
      temperature: 0.8
    });
  }, [prompt]);

  /**
   * Tailor resume for job
   */
  const tailorForJob = useCallback(async (resumeSection, jobDescription) => {
    const promptText = `Tailor this resume section to match this job description:\n\nResume Section:\n${resumeSection}\n\nJob Description:\n${jobDescription}`;
    
    return prompt(promptText, {
      context: 'Customize resume for specific job',
      temperature: 0.7
    });
  }, [prompt]);

  /**
   * Clear response
   */
  const clear = useCallback(() => {
    setResponse('');
    setStreamingResponse('');
  }, []);

  /**
   * Cleanup session
   */
  const cleanup = useCallback(() => {
    if (session && session.destroy) {
      session.destroy();
    }
    setSession(null);
    setResponse('');
    setStreamingResponse('');
  }, [session]);

  return {
    // State
    isProcessing,
    response,
    streamingResponse,
    session,
    
    // Core functions
    initialize,
    prompt,
    promptStreaming,
    
    // Resume-specific features
    generateInterviewQuestions,
    improveResumeSection,
    generateCoverLetter,
    suggestSkills,
    analyzeResume,
    generateAchievements,
    tailorForJob,
    
    // Utilities
    clear,
    cleanup
  };
};

export default useLanguageModel;
