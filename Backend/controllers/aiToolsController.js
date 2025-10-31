import OpenAI from "openai";
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate professional summary
export const generateSummary = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || !input.trim()) {
      return errorResponse(res, 400, "Input is required");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a professional resume writer. Generate a concise, powerful professional summary based on the provided experience. Keep it between 3-5 sentences.",
        },
        {
          role: "user",
          content: input,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return successResponse(
      res,
      200,
      "Summary generated successfully",
      { content: completion.choices[0].message.content },
      true
    );
  } catch (error) {
    console.error("Generate Summary Error:", error);
    return errorResponse(res, 500, "Failed to generate summary", {
      error: error.message,
    });
  }
};

// Enhance work experience descriptions
export const enhanceExperience = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || !input.trim()) {
      return errorResponse(res, 400, "Input is required");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a professional resume writer. Enhance the provided job description using strong action verbs and quantifiable achievements. Focus on impact and results.",
        },
        {
          role: "user",
          content: input,
        },
      ],
      max_tokens: 250,
      temperature: 0.7,
    });

    return successResponse(
      res,
      200,
      "Experience enhanced successfully",
      { content: completion.choices[0].message.content },
      true
    );
  } catch (error) {
    console.error("Enhance Experience Error:", error);
    return errorResponse(res, 500, "Failed to enhance experience", {
      error: error.message,
    });
  }
};

// Analyze and suggest relevant skills
export const analyzeSkills = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || !input.trim()) {
      return errorResponse(res, 400, "Input is required");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a professional career counselor. Analyze the provided experience and suggest relevant technical and soft skills. List them as bullet points.",
        },
        {
          role: "user",
          content: input,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return successResponse(
      res,
      200,
      "Skills analyzed successfully",
      { content: completion.choices[0].message.content },
      true
    );
  } catch (error) {
    console.error("Analyze Skills Error:", error);
    return errorResponse(res, 500, "Failed to analyze skills", {
      error: error.message,
    });
  }
};

// Format education section
export const formatEducation = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || !input.trim()) {
      return errorResponse(res, 400, "Input is required");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a professional resume writer. Format the provided education details in a clear, professional manner suitable for a resume.",
        },
        {
          role: "user",
          content: input,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return successResponse(
      res,
      200,
      "Education formatted successfully",
      { content: completion.choices[0].message.content },
      true
    );
  } catch (error) {
    console.error("Format Education Error:", error);
    return errorResponse(res, 500, "Failed to format education", {
      error: error.message,
    });
  }
};

// Generate cover letter
export const generateCoverLetter = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || !input.trim()) {
      return errorResponse(res, 400, "Input is required");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a professional resume writer. Generate a compelling, professional cover letter based on the provided job description and qualifications. Keep it concise and impactful.",
        },
        {
          role: "user",
          content: input,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return successResponse(
      res,
      200,
      "Cover letter generated successfully",
      { content: completion.choices[0].message.content },
      true
    );
  } catch (error) {
    console.error("Generate Cover Letter Error:", error);
    return errorResponse(res, 500, "Failed to generate cover letter", {
      error: error.message,
    });
  }
};

// Proofread text (fallback for Chrome Proofreader API)
export const proofreadText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return errorResponse(res, 400, "Text is required");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a professional proofreader. Check the provided text for grammar, spelling, and punctuation errors. Return the corrected text only, without explanations.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    return successResponse(
      res,
      200,
      "Text proofread successfully",
      { corrected: completion.choices[0].message.content },
      true
    );
  } catch (error) {
    console.error("Proofread Text Error:", error);
    return errorResponse(res, 500, "Failed to proofread text", {
      error: error.message,
    });
  }
};

// Rewrite text (fallback for Chrome Rewriter API)
export const rewriteText = async (req, res) => {
  try {
    const { text, tone, length } = req.body;

    if (!text || !text.trim()) {
      return errorResponse(res, 400, "Text is required");
    }

    let prompt = `Rewrite the following text`;
    if (tone) prompt += ` in a ${tone} tone`;
    if (length) prompt += ` making it ${length}`;
    prompt += `:\n\n${text}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a professional writing assistant. Rewrite the provided text according to the specified requirements. Maintain the core message while improving clarity and style.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return successResponse(
      res,
      200,
      "Text rewritten successfully",
      { rewritten: completion.choices[0].message.content },
      true
    );
  } catch (error) {
    console.error("Rewrite Text Error:", error);
    return errorResponse(res, 500, "Failed to rewrite text", {
      error: error.message,
    });
  }
};

// Summarize text (fallback for Chrome Summarizer API)
export const summarizeText = async (req, res) => {
  try {
    const { text, length } = req.body;

    if (!text || !text.trim()) {
      return errorResponse(res, 400, "Text is required");
    }

    let prompt = `Summarize the following text`;
    if (length) prompt += ` in ${length === 'short' ? '1-2' : length === 'medium' ? '2-3' : '3-4'} sentences`;
    prompt += `:\n\n${text}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a professional summarization assistant. Provide concise, accurate summaries that capture the key points.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.5,
    });

    return successResponse(
      res,
      200,
      "Text summarized successfully",
      { summary: completion.choices[0].message.content },
      true
    );
  } catch (error) {
    console.error("Summarize Text Error:", error);
    return errorResponse(res, 500, "Failed to summarize text", {
      error: error.message,
    });
  }
};

// Generate interview questions
export const generateInterviewQuestions = async (req, res) => {
  try {
    const { jobTitle, skills, experience, count = 10 } = req.body;

    if (!jobTitle) {
      return errorResponse(res, 400, "Job title is required");
    }

    const prompt = `Generate ${count} common interview questions for a ${jobTitle} position${skills ? ` with skills in ${skills.join(', ')}` : ''}${experience ? ` and ${experience} years of experience` : ''}. Format as a numbered list.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert career coach and interviewer. Generate realistic, relevant interview questions that mix behavioral, technical, and situational questions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    return successResponse(
      res,
      200,
      "Interview questions generated successfully",
      { questions: completion.choices[0].message.content },
      true
    );
  } catch (error) {
    console.error("Generate Interview Questions Error:", error);
    return errorResponse(res, 500, "Failed to generate interview questions", {
      error: error.message,
    });
  }
};

// Generate answer suggestion for interview question
export const generateAnswerSuggestion = async (req, res) => {
  try {
    const { question, jobTitle, skills, experience } = req.body;

    if (!question || !question.trim()) {
      return errorResponse(res, 400, "Question is required");
    }

    const prompt = `As a ${jobTitle || 'professional'}${skills ? ` with skills in ${skills.join(', ')}` : ''}${experience ? ` and ${experience} of experience` : ''}, provide a strong, professional answer to this interview question using the STAR method:\n\n"${question}"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert career coach. Provide concise, professional interview answers using the STAR method (Situation, Task, Action, Result) when applicable. Keep answers to 2-3 paragraphs.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    return successResponse(
      res,
      200,
      "Answer suggestion generated successfully",
      { answer: completion.choices[0].message.content },
      true
    );
  } catch (error) {
    console.error("Generate Answer Suggestion Error:", error);
    return errorResponse(res, 500, "Failed to generate answer suggestion", {
      error: error.message,
    });
  }
};
