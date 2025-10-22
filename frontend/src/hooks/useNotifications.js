import { useState, useEffect, useCallback, useRef } from "react";
import { NotificationAPI } from "../services/notificationAPI.js";

// Custom hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const unreadPollRef = useRef(null);

  // Fetch notifications (full list)
  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await NotificationAPI.getUserNotifications(params);
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lightweight unread count fetch (uses stats endpoint)
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await NotificationAPI.getNotificationStats();
      // Try common shapes returned by backend
      const unread = res?.data?.stats?.unread ?? res?.data?.unread ?? 0;
      setUnreadCount(unread || 0);
      return unread || 0;
    } catch (err) {
      console.error("Fetch unread count error:", err);
      return 0;
    }
  }, []);

  // Mark as read
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        await NotificationAPI.markAsRead(notificationId);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        // reconcile with server
        fetchUnreadCount();
      } catch (err) {
        setError(err.message);
        console.error("Mark as read error:", err);
        throw err;
      }
    },
    [fetchUnreadCount]
  );

  // Mark as unread
  const markAsUnread = useCallback(
    async (notificationId) => {
      try {
        await NotificationAPI.markAsUnread(notificationId);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, isRead: false, readAt: null } : n))
        );
        setUnreadCount((prev) => prev + 1);
        fetchUnreadCount();
      } catch (err) {
        setError(err.message);
        console.error("Mark as unread error:", err);
        throw err;
      }
    },
    [fetchUnreadCount]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date() })));
      setUnreadCount(0);
      fetchUnreadCount();
    } catch (err) {
      setError(err.message);
      console.error("Mark all as read error:", err);
      throw err;
    }
  }, [fetchUnreadCount]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        await NotificationAPI.deleteNotification(notificationId);
        const deleted = notifications.find((n) => n._id === notificationId);
        setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
        if (deleted && !deleted.isRead) setUnreadCount((prev) => Math.max(0, prev - 1));
        fetchUnreadCount();
      } catch (err) {
        setError(err.message);
        console.error("Delete notification error:", err);
        throw err;
      }
    },
    [notifications, fetchUnreadCount]
  );

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    try {
      await NotificationAPI.deleteAllRead();
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (err) {
      setError(err.message);
      console.error("Delete all read error:", err);
      throw err;
    }
  }, []);
  
  // Delete all notifications (both read and unread)
  const deleteAllNotifications = useCallback(async () => {
    try {
      await NotificationAPI.deleteAll();
      setNotifications([]);
      setUnreadCount(0);
      window.location.reload();
      return true;
    } catch (err) {
      setError(err.message);
      console.error("Delete all notifications error:", err);
      throw err;
    }
  }, []);

  // Get stats
  const getStats = useCallback(async () => {
    try {
      const res = await NotificationAPI.getNotificationStats();
      return res.data;
    } catch (err) {
      setError(err.message);
      console.error("Get stats error:", err);
      throw err;
    }
  }, []);

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchNotifications({ limit: 20 });
  }, [fetchNotifications]);

  // Lightweight unread polling
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    // fetch once
    fetchUnreadCount();
    unreadPollRef.current = setInterval(() => {
      fetchUnreadCount();
    }, 15000);
    return () => clearInterval(unreadPollRef.current);
  }, [fetchUnreadCount]);

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
    deleteAllNotifications,
    getStats,
    setError,
  };
};

// Notification preferences hook
export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await NotificationAPI.getNotificationPreferences();
      setPreferences(res.data.preferences);
      return res.data.preferences;
    } catch (err) {
      setError(err.message);
      console.error("Fetch preferences error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (newPrefs) => {
    try {
      setLoading(true);
      setError(null);
      const res = await NotificationAPI.updateNotificationPreferences(newPrefs);
      setPreferences(res.data.preferences);
      return res.data.preferences;
    } catch (err) {
      setError(err.message);
      console.error("Update preferences error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchPreferences();
  }, [fetchPreferences]);

  return { preferences, loading, error, fetchPreferences, updatePreferences, setError };
};

export default null;
