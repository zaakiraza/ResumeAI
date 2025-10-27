import express from 'express';
import {
  generateSummary,
  enhanceExperience,
  analyzeSkills,
  formatEducation,
  generateCoverLetter
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

export default router;