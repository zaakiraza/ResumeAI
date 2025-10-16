import { useState, useEffect, useCallback } from 'react';
import { FeedbackAPI } from '../services/feedbackAPI.js';

// Custom hook for managing feedback
export const useFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Submit feedback
  const submitFeedback = useCallback(async (feedbackData) => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Add browser and page info
      const enrichedData = {
        ...feedbackData,
        browserInfo: FeedbackAPI.getBrowserInfo(),
        pageInfo: FeedbackAPI.getPageInfo(),
      };
      
      const response = await FeedbackAPI.submitFeedback(enrichedData);
      
      // Add to local state if successful
      if (response.data.feedback) {
        setFeedback(prev => [response.data.feedback, ...prev]);
      }
      
      return response.data.feedback;
    } catch (err) {
      setError(err.message);
      console.error('Submit feedback error:', err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  // Submit anonymous feedback
  const submitAnonymousFeedback = useCallback(async (feedbackData) => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Add browser and page info
      const enrichedData = {
        ...feedbackData,
        browserInfo: FeedbackAPI.getBrowserInfo(),
        pageInfo: FeedbackAPI.getPageInfo(),
      };
      
      const response = await FeedbackAPI.submitAnonymousFeedback(enrichedData);
      return response.data.feedback;
    } catch (err) {
      setError(err.message);
      console.error('Submit anonymous feedback error:', err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  // Fetch user feedback
  const fetchUserFeedback = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await FeedbackAPI.getUserFeedback(params);
      setFeedback(response.data.feedback || []);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Fetch user feedback error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get feedback by ID
  const getFeedbackById = useCallback(async (feedbackId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await FeedbackAPI.getFeedbackById(feedbackId);
      return response.data.feedback;
    } catch (err) {
      setError(err.message);
      console.error('Get feedback error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Vote on feedback
  const voteFeedback = useCallback(async (feedbackId, voteType) => {
    try {
      const response = await FeedbackAPI.voteFeedback(feedbackId, voteType);
      
      // Update local state if feedback exists in current list
      setFeedback(prev => 
        prev.map(item => 
          item._id === feedbackId 
            ? { 
                ...item, 
                upvotes: response.data.upvotes,
                downvotes: response.data.downvotes,
                netVotes: response.data.netVotes
              }
            : item
        )
      );
      
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Vote feedback error:', err);
      throw err;
    }
  }, []);

  // Remove vote from feedback
  const removeVote = useCallback(async (feedbackId) => {
    try {
      const response = await FeedbackAPI.removeVote(feedbackId);
      
      // Update local state if feedback exists in current list
      setFeedback(prev => 
        prev.map(item => 
          item._id === feedbackId 
            ? { 
                ...item, 
                upvotes: response.data.upvotes,
                downvotes: response.data.downvotes,
                netVotes: response.data.netVotes
              }
            : item
        )
      );
      
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Remove vote error:', err);
      throw err;
    }
  }, []);

  // Delete feedback
  const deleteFeedback = useCallback(async (feedbackId) => {
    try {
      await FeedbackAPI.deleteFeedback(feedbackId);
      
      // Remove from local state
      setFeedback(prev => prev.filter(item => item._id !== feedbackId));
    } catch (err) {
      setError(err.message);
      console.error('Delete feedback error:', err);
      throw err;
    }
  }, []);

  // Load user feedback on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserFeedback({ limit: 10 });
    }
  }, [fetchUserFeedback]);

  return {
    feedback,
    loading,
    submitting,
    error,
    submitFeedback,
    submitAnonymousFeedback,
    fetchUserFeedback,
    getFeedbackById,
    voteFeedback,
    removeVote,
    deleteFeedback,
    setError, // Allow manual error clearing
  };
};

// Custom hook for admin feedback management
export const useAdminFeedback = () => {
  const [allFeedback, setAllFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all feedback (admin only)
  const fetchAllFeedback = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await FeedbackAPI.getAllFeedback(params);
      setAllFeedback(response.data.feedback || []);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Fetch all feedback error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update feedback status (admin only)
  const updateFeedbackStatus = useCallback(async (feedbackId, status) => {
    try {
      const response = await FeedbackAPI.updateFeedbackStatus(feedbackId, status);
      
      // Update local state
      setAllFeedback(prev => 
        prev.map(item => 
          item._id === feedbackId 
            ? { ...item, status }
            : item
        )
      );
      
      return response.data.feedback;
    } catch (err) {
      setError(err.message);
      console.error('Update feedback status error:', err);
      throw err;
    }
  }, []);

  // Add admin note (admin only)
  const addAdminNote = useCallback(async (feedbackId, note) => {
    try {
      const response = await FeedbackAPI.addAdminNote(feedbackId, note);
      
      // Update local state
      setAllFeedback(prev => 
        prev.map(item => 
          item._id === feedbackId 
            ? response.data.feedback
            : item
        )
      );
      
      return response.data.feedback;
    } catch (err) {
      setError(err.message);
      console.error('Add admin note error:', err);
      throw err;
    }
  }, []);

  // Resolve feedback (admin only)
  const resolveFeedback = useCallback(async (feedbackId, resolutionNote) => {
    try {
      const response = await FeedbackAPI.resolveFeedback(feedbackId, resolutionNote);
      
      // Update local state
      setAllFeedback(prev => 
        prev.map(item => 
          item._id === feedbackId 
            ? response.data.feedback
            : item
        )
      );
      
      return response.data.feedback;
    } catch (err) {
      setError(err.message);
      console.error('Resolve feedback error:', err);
      throw err;
    }
  }, []);

  // Get feedback statistics (admin only)
  const getFeedbackStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await FeedbackAPI.getFeedbackStats();
      setStats(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Get feedback stats error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    allFeedback,
    stats,
    loading,
    error,
    fetchAllFeedback,
    updateFeedbackStatus,
    addAdminNote,
    resolveFeedback,
    getFeedbackStats,
    setError,
  };
};

export default useFeedback;