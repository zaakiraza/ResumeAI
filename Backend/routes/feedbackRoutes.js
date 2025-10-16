import express from 'express';
import { authenticateToken } from '../middleware/authentication.js';
import { admin } from '../middleware/admin.js';
import {
  createFeedback,
  getAllFeedback,
  getUserFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  addAdminNote,
  resolveFeedback,
  voteFeedback,
  removeVote,
  getFeedbackStats,
  deleteFeedback,
} from '../controllers/feedbackController.js';

const feedbackRouter = express.Router();

// Public routes (no authentication required)
feedbackRouter.post('/anonymous', createFeedback);                   // POST /api/feedback/anonymous - Submit anonymous feedback

// Authenticated user routes
feedbackRouter.use(authenticateToken);
feedbackRouter.post('/', createFeedback);                           // POST /api/feedback - Submit feedback
feedbackRouter.get('/user', getUserFeedback);                       // GET /api/feedback/user - Get user's feedback
feedbackRouter.get('/:id', getFeedbackById);                        // GET /api/feedback/:id - Get feedback by ID
feedbackRouter.delete('/:id', deleteFeedback);                      // DELETE /api/feedback/:id - Delete feedback

// Voting on public feedback
feedbackRouter.post('/:id/vote', voteFeedback);                     // POST /api/feedback/:id/vote - Vote on feedback
feedbackRouter.delete('/:id/vote', removeVote);                     // DELETE /api/feedback/:id/vote - Remove vote

// Admin only routes
feedbackRouter.get('/', admin, getAllFeedback);                     // GET /api/feedback - Get all feedback (admin)
feedbackRouter.get('/stats/overview', admin, getFeedbackStats);     // GET /api/feedback/stats/overview - Get feedback statistics (admin)
feedbackRouter.patch('/:id/status', admin, updateFeedbackStatus);   // PATCH /api/feedback/:id/status - Update feedback status (admin)
feedbackRouter.post('/:id/notes', admin, addAdminNote);             // POST /api/feedback/:id/notes - Add admin note (admin)
feedbackRouter.patch('/:id/resolve', admin, resolveFeedback);       // PATCH /api/feedback/:id/resolve - Resolve feedback (admin)

export default feedbackRouter;