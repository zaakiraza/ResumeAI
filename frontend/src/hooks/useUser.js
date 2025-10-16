import { useState, useEffect, useCallback } from 'react';
import { UserAPI } from '../services/userAPI.js';

// Custom hook for user profile management
export const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await UserAPI.getUserProfile();
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      setError(err.message);
      console.error('Fetch user error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile
  const updateUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await UserAPI.updateUserProfile(userData);
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      setError(err.message);
      console.error('Update user error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    }
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    fetchUser,
    updateUser,
    setError, // Allow manual error clearing
  };
};

// Custom hook for user analytics
export const useUserAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await UserAPI.getUserAnalytics();
      setAnalytics(response.data.analytics);
      return response.data.analytics;
    } catch (err) {
      setError(err.message);
      console.error('Fetch analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load analytics on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchAnalytics();
    }
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    setError,
  };
};

export default useUser;