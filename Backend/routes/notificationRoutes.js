import express from 'express';
import { authenticateToken } from '../middleware/authentication.js';
import {
  getUserNotifications,
  getNotificationById,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  getNotificationStats,
  createNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../controllers/notificationController.js';

const notificationRouter = express.Router();

// All notification routes require authentication
notificationRouter.use(authenticateToken);

// Notification CRUD operations
notificationRouter.get('/', getUserNotifications);                    // GET /api/notifications - Get user notifications
notificationRouter.post('/', createNotification);                    // POST /api/notifications - Create notification
notificationRouter.get('/stats', getNotificationStats);              // GET /api/notifications/stats - Get notification statistics
notificationRouter.get('/preferences', getNotificationPreferences);  // GET /api/notifications/preferences - Get notification preferences
notificationRouter.put('/preferences', updateNotificationPreferences); // PUT /api/notifications/preferences - Update notification preferences

// Bulk operations
notificationRouter.patch('/mark-all-read', markAllNotificationsAsRead); // PATCH /api/notifications/mark-all-read - Mark all as read
notificationRouter.delete('/read', deleteAllReadNotifications);       // DELETE /api/notifications/read - Delete all read notifications

// Individual notification operations
notificationRouter.get('/:id', getNotificationById);                 // GET /api/notifications/:id - Get notification by ID
notificationRouter.patch('/:id/read', markNotificationAsRead);       // PATCH /api/notifications/:id/read - Mark as read
notificationRouter.patch('/:id/unread', markNotificationAsUnread);   // PATCH /api/notifications/:id/unread - Mark as unread
notificationRouter.delete('/:id', deleteNotification);               // DELETE /api/notifications/:id - Delete notification

export default notificationRouter;