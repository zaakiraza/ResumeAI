import express from 'express';
import { authenticateToken } from '../middleware/authentication.js';
import {
  createResume,
  getUserResumes,
  getResumeById,
  updateResume,
  deleteResume,
  duplicateResume,
  updateResumeStatus,
  trackResumeDownload,
  saveResumeAsDraft,
  downloadResumePDF,
  getResumeTemplates,
  getResumePDFUrl,
  uploadResumePDFToCloudinary
} from '../controllers/resumeController.js';

const resumeRouter = express.Router();

// All resume routes require authentication
resumeRouter.use(authenticateToken);

// Resume CRUD operations
resumeRouter.post('/', createResume);                    // POST /api/resumes - Create new resume
resumeRouter.get('/', getUserResumes);                   // GET /api/resumes - Get all user resumes
resumeRouter.get('/templates', getResumeTemplates);     // GET /api/resumes/templates - Get templates
resumeRouter.post('/draft', saveResumeAsDraft);         // POST /api/resumes/draft - Create new draft
resumeRouter.get('/:id', getResumeById);                // GET /api/resumes/:id - Get specific resume
resumeRouter.put('/:id', updateResume);                 // PUT /api/resumes/:id - Update resume
resumeRouter.delete('/:id', deleteResume);              // DELETE /api/resumes/:id - Delete resume

// Resume-specific operations
resumeRouter.post('/:id/duplicate', duplicateResume);   // POST /api/resumes/:id/duplicate - Duplicate resume
resumeRouter.patch('/:id/status', updateResumeStatus); // PATCH /api/resumes/:id/status - Update status
resumeRouter.post('/:id/download', trackResumeDownload); // POST /api/resumes/:id/download - Track download
resumeRouter.post('/:id/draft', saveResumeAsDraft);     // POST /api/resumes/:id/draft - Save as draft
resumeRouter.get('/:id/pdf', downloadResumePDF);        // GET /api/resumes/:id/pdf - Download PDF
resumeRouter.get('/:id/pdf-url', getResumePDFUrl);      // GET /api/resumes/:id/pdf-url - Get Cloudinary PDF URL
resumeRouter.post('/:id/pdf-url', uploadResumePDFToCloudinary); // POST /api/resumes/:id/pdf-url - Save PDF URL

export default resumeRouter;