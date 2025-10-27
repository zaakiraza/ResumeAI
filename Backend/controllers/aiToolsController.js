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
