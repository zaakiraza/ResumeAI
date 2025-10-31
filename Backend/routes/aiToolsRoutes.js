import express from 'express';
import {
  generateSummary,
  enhanceExperience,
  analyzeSkills,
  formatEducation,
  generateCoverLetter,
  proofreadText,
  rewriteText,
  summarizeText,
  generateInterviewQuestions,
  generateAnswerSuggestion
} from '../controllers/aiToolsController.js';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// AI tool routes
router.post('/generate-summary', generateSummary);
router.post('/enhance-experience', enhanceExperience);
router.post('/analyze-skills', analyzeSkills);
router.post('/format-education', formatEducation);
router.post('/generate-cover-letter', generateCoverLetter);

// Chrome AI Fallback routes
router.post('/proofread', proofreadText);
router.post('/rewrite', rewriteText);
router.post('/summarize', summarizeText);
router.post('/interview-questions', generateInterviewQuestions);
router.post('/answer-suggestion', generateAnswerSuggestion);

export default router;