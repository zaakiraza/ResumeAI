import { API_CONFIG, buildApiUrl } from '../config/api.js';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

// Helper function to build headers
const buildHeaders = (contentType = 'application/json') => {
  const headers = {
    'Content-Type': contentType,
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
};

// Notification API Service
export class NotificationAPI {
  
  // Get user notifications
  static async getUserNotifications(params = {}) {
    try {
      const searchParams = new URLSearchParams(params);
      const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATIONS)}?${searchParams}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get Notifications Error:', error);
      throw error;
    }
  }

  // Get notification by ID
  static async getNotificationById(notificationId) {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATION_BY_ID.replace(':id', notificationId));
      
      const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get Notification Error:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATION_MARK_READ.replace(':id', notificationId));
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Mark Read Error:', error);
      throw error;
    }
  }

  // Mark notification as unread
  static async markAsUnread(notificationId) {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATION_MARK_UNREAD.replace(':id', notificationId));
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Mark Unread Error:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead() {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATION_MARK_ALL_READ);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Mark All Read Error:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId) {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATION_BY_ID.replace(':id', notificationId));
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Delete Notification Error:', error);
      throw error;
    }
  }

  // Delete all read notifications
  static async deleteAllRead() {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATION_DELETE_READ);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Delete All Read Error:', error);
      throw error;
    }
  }

  // Get notification statistics
  static async getNotificationStats() {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATION_STATS);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get Notification Stats Error:', error);
      throw error;
    }
  }

  // Create notification (for testing)
  static async createNotification(notificationData) {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATIONS), {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(notificationData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Create Notification Error:', error);
      throw error;
    }
  }

  // Get notification preferences
  static async getNotificationPreferences() {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATION_PREFERENCES);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get Preferences Error:', error);
      throw error;
    }
  }

  // Update notification preferences
  static async updateNotificationPreferences(preferences) {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATION_PREFERENCES);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify({ preferences }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Update Preferences Error:', error);
      throw error;
    }
  }
}

// Export individual functions for easier importing
export const {
  getUserNotifications,
  getNotificationById,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  getNotificationStats,
  createNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
} = NotificationAPI;

// Default export
export default NotificationAPI;