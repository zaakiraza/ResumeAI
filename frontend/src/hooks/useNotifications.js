import { useState, useEffect, useCallback } from 'react';
import { NotificationAPI } from '../services/notificationAPI.js';

// Custom hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching notifications with params:', params);
      const response = await NotificationAPI.getUserNotifications(params);
      console.log('Full notification response:', response);
      console.log('Notifications array:', response.data?.notifications);
      console.log('Unread count:', response.data?.unreadCount);
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await NotificationAPI.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date() }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message);
      console.error('Mark as read error:', err);
      throw err;
    }
  }, []);

  // Mark notification as unread
  const markAsUnread = useCallback(async (notificationId) => {
    try {
      await NotificationAPI.markAsUnread(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: false, readAt: null }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
    } catch (err) {
      setError(err.message);
      console.error('Mark as unread error:', err);
      throw err;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationAPI.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date()
        }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
      console.error('Mark all as read error:', err);
      throw err;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await NotificationAPI.deleteNotification(notificationId);
      
      // Update local state
      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      // Update unread count if deleted notification was unread
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err.message);
      console.error('Delete notification error:', err);
      throw err;
    }
  }, [notifications]);

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    try {
      await NotificationAPI.deleteAllRead();
      
      // Update local state - keep only unread notifications
      setNotifications(prev => prev.filter(notification => !notification.isRead));
    } catch (err) {
      setError(err.message);
      console.error('Delete all read error:', err);
      throw err;
    }
  }, []);

  // Get notification statistics
  const getStats = useCallback(async () => {
    try {
      const response = await NotificationAPI.getNotificationStats();
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Get stats error:', err);
      throw err;
    }
  }, []);

  // Load notifications on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchNotifications({ limit: 20 });
    }
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    getStats,
    setError, // Allow manual error clearing
  };
};

// Custom hook for notification preferences
export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await NotificationAPI.getNotificationPreferences();
      setPreferences(response.data.preferences);
      return response.data.preferences;
    } catch (err) {
      setError(err.message);
      console.error('Fetch preferences error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences) => {
    try {
      setLoading(true);
      setError(null);
      const response = await NotificationAPI.updateNotificationPreferences(newPreferences);
      setPreferences(response.data.preferences);
      return response.data.preferences;
    } catch (err) {
      setError(err.message);
      console.error('Update preferences error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load preferences on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchPreferences();
    }
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    fetchPreferences,
    updatePreferences,
    setError,
  };
};

export default useNotifications;