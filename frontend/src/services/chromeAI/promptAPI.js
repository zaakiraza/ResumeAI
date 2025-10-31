import { checkAPIAvailability, withAIErrorHandling } from './baseAIService';

/**
 * Create a Language Model session
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Language Model session
 */
export const createLanguageModel = async (options = {}) => {
  const availability = await checkAPIAvailability('LanguageModel');
  
  if (!availability.available) {
    throw new Error(availability.reason || 'Prompt API not available');
  }

  const params = await self.ai.languageModel.params();
  
  const session = await self.ai.languageModel.create({
    temperature: options.temperature || params.defaultTemperature,
    topK: options.topK || params.defaultTopK,
    initialPrompts: options.initialPrompts || [],
    expectedInputs: options.expectedInputs || [
      { type: 'text', languages: ['en'] }
    ],
    expectedOutputs: options.expectedOutputs || [
      { type: 'text', languages: ['en'] }
    ],
    monitor(m) {
      if (options.onDownloadProgress) {
        m.addEventListener('downloadprogress', (e) => {
          options.onDownloadProgress(e.loaded * 100);
        });
      }
    }
  });

  return session;
};

// Alias for backwards compatibility
export const createSession = createLanguageModel;

/**
 * Send a prompt and get response
 * @param {Object} session - Language model session
 * @param {string} prompt - The prompt text
 * @param {string} context - Optional context
 * @returns {Promise<string>} Response text
 */
export const promptModel = async (session, prompt, context) => {
  if (!prompt || prompt.trim().length === 0) {
    return '';
  }

  return withAIErrorHandling(async () => {
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    const result = await session.prompt(fullPrompt);
    return result;
  }, 'Prompt API');
};

/**
 * Send a prompt and get response (convenience method that creates session)
 * @param {string} prompt - The prompt text
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} Response text
 */
export const sendPrompt = async (prompt, options = {}) => {
  if (!prompt || prompt.trim().length === 0) {
    return '';
  }

  return withAIErrorHandling(async () => {
    const session = await createLanguageModel(options);
    const result = await promptModel(session, prompt);
    
    // Clean up
    if (session.destroy) {
      session.destroy();
    }

    return result;
  }, 'Prompt API');
};

/**
 * Send a prompt with streaming response
 * @param {Object} session - Language model session
 * @param {string} prompt - The prompt text
 * @param {string} context - Optional context
 * @returns {AsyncIterable<string>} Stream of response text
 */
export const promptModelStreaming = async (session, prompt, context) => {
  if (!prompt || prompt.trim().length === 0) {
    return;
  }

  const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
  return session.promptStreaming(fullPrompt);
};

/**
 * Send a prompt with streaming response (convenience method)
 * @param {string} prompt - The prompt text
 * @param {Object} options - Configuration options
 * @param {Function} onChunk - Callback for each chunk
 * @returns {Promise<string>} Complete response text
 */
export const sendPromptStreaming = async (prompt, options = {}, onChunk) => {
  if (!prompt || prompt.trim().length === 0) {
    return '';
  }

  return withAIErrorHandling(async () => {
    const session = await createLanguageModel(options);
    const stream = await promptModelStreaming(session, prompt);

    let result = '';
    for await (const chunk of stream) {
      result = chunk; // Note: chunk contains the full text so far, not incremental
      if (onChunk) {
        onChunk(result);
      }
    }
    
    // Clean up
    if (session.destroy) {
      session.destroy();
    }

    return result;
  }, 'Prompt API');
};

/**
 * Generate interview questions based on resume
 * @param {Object} resumeData - Resume data (jobTitle, skills, experience, etc.)
 * @param {number} count - Number of questions to generate
 * @returns {Promise<string>} Interview questions
 */
export const generateInterviewQuestions = async (resumeData, count = 10) => {
  const { jobTitle, skills, yearsOfExperience, companyName } = resumeData;
  
  const prompt = `Generate ${count} common interview questions for the following profile:

Job Role: ${jobTitle || 'Professional'}
Skills: ${skills ? skills.join(', ') : 'Not specified'}
Experience: ${yearsOfExperience || 'Entry level'}
${companyName ? `Target Company: ${companyName}` : ''}

Format the questions as a numbered list. Make them relevant to the role and skills mentioned.`;

  return sendPrompt(prompt);
};

/**
 * Generate answer suggestions for interview questions
 * @param {string} question - Interview question
 * @param {Object} resumeData - Resume data for context
 * @returns {Promise<string>} Answer suggestion
 */
export const generateAnswerSuggestion = async (question, resumeData) => {
  const { jobTitle, skills, workExperience } = resumeData;
  
  const prompt = `As a ${jobTitle || 'professional'} with skills in ${skills ? skills.join(', ') : 'various technologies'}, provide a strong answer to this interview question:

"${question}"

${workExperience ? `Relevant experience: ${workExperience}` : ''}

Provide a concise, professional answer that highlights relevant skills and experience.`;

  return sendPrompt(prompt);
};

/**
 * Analyze skills gap for target role
 * @param {Array<string>} currentSkills - Current skills
 * @param {string} targetRole - Target job role
 * @returns {Promise<string>} Skills gap analysis
 */
export const analyzeSkillsGap = async (currentSkills, targetRole) => {
  const prompt = `Analyze the skills gap for the following:

Current Skills: ${currentSkills.join(', ')}
Target Role: ${targetRole}

Please provide:
1. Skills you already have that match the role
2. Important skills you're missing
3. Top 3-5 skills to prioritize learning
4. Brief learning resources or suggestions for each missing skill

Format the response clearly with sections.`;

  return sendPrompt(prompt);
};

/**
 * Get resume improvement suggestions
 * @param {Object} resumeContent - Resume content
 * @returns {Promise<string>} Improvement suggestions
 */
export const getResumeImprovements = async (resumeContent) => {
  const { careerObjective, workExperience, skills, education } = resumeContent;
  
  const prompt = `Review this resume content and provide 5 specific, actionable improvement suggestions:

Career Objective: ${careerObjective || 'Not provided'}

Work Experience: ${workExperience || 'Not provided'}

Skills: ${Array.isArray(skills) ? skills.join(', ') : skills || 'Not provided'}

Education: ${education || 'Not provided'}

Focus on:
1. Content clarity and impact
2. Professional language
3. Quantifiable achievements
4. ATS optimization
5. Overall presentation

Provide numbered suggestions with specific examples.`;

  return sendPrompt(prompt);
};

/**
 * Generate a cover letter introduction
 * @param {Object} data - Job and resume data
 * @returns {Promise<string>} Cover letter introduction
 */
export const generateCoverLetterIntro = async (data) => {
  const { jobTitle, companyName, keySkills, yearsOfExperience } = data;
  
  const prompt = `Write a professional and engaging cover letter introduction for:

Position: ${jobTitle}
Company: ${companyName}
Key Skills: ${keySkills ? keySkills.join(', ') : 'Not specified'}
Experience Level: ${yearsOfExperience || 'Entry level'}

Keep it concise (2-3 sentences), compelling, and professional. Show enthusiasm and highlight why you're a good fit.`;

  return sendPrompt(prompt);
};

/**
 * Get ATS optimization suggestions
 * @param {string} resumeText - Full resume text
 * @param {string} jobDescription - Target job description
 * @returns {Promise<string>} ATS optimization tips
 */
export const getATSOptimization = async (resumeText, jobDescription) => {
  const prompt = `Analyze this resume for ATS (Applicant Tracking System) optimization:

Resume Content:
${resumeText}

Target Job Description:
${jobDescription}

Provide:
1. Keywords from the job description that should be included
2. Formatting improvements for ATS compatibility
3. Sections that need strengthening
4. Overall ATS score (1-10) and reasoning

Be specific and actionable.`;

  return sendPrompt(prompt);
};
