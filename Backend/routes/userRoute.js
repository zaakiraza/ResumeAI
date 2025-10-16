import express from 'express';
import { authenticateToken } from '../middleware/authentication.js';
import { admin } from '../middleware/admin.js';
import { userController } from '../controllers/userController.js';

const userRouter = express.Router();

// Admin routes
userRouter.get('/', authenticateToken, admin, userController.getAllUsers);

// User profile routes (require authentication)
userRouter.get('/profile', authenticateToken, userController.getUserProfile);
userRouter.put('/profile', authenticateToken, userController.updateUserProfile);
userRouter.get('/analytics', authenticateToken, userController.getUserAnalytics);

export default userRouter;
