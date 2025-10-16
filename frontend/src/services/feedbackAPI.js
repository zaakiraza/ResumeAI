import { API_CONFIG, buildApiUrl } from "../config/api.js";

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token") || "";
};

// Helper function to build headers
const buildHeaders = (contentType = "application/json") => {
  const headers = {
    "Content-Type": contentType,
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
};

// Feedback API Service
export class FeedbackAPI {
  // Submit feedback (authenticated)
  static async submitFeedback(feedbackData) {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.FEEDBACK), {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(feedbackData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Submit Feedback Error:", error);
      throw error;
    }
  }

  // Submit anonymous feedback
  static async submitAnonymousFeedback(feedbackData) {
    try {
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.FEEDBACK_ANONYMOUS),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }, // No auth token for anonymous
          body: JSON.stringify({ ...feedbackData, isAnonymous: true }),
        }
      );

      return await handleResponse(response);
    } catch (error) {
      console.error("Submit Anonymous Feedback Error:", error);
      throw error;
    }
  }

  // Get user's feedback
  static async getUserFeedback(params = {}) {
    try {
      const searchParams = new URLSearchParams(params);
      const url = `${buildApiUrl(
        API_CONFIG.ENDPOINTS.FEEDBACK_USER
      )}?${searchParams}`;

      const response = await fetch(url, {
        method: "GET",
        headers: buildHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Get User Feedback Error:", error);
      throw error;
    }
  }

  // Get all feedback (admin only)
  static async getAllFeedback(params = {}) {
    try {
      const searchParams = new URLSearchParams(params);
      const url = `${buildApiUrl(
        API_CONFIG.ENDPOINTS.FEEDBACK
      )}?${searchParams}`;

      const response = await fetch(url, {
        method: "GET",
        headers: buildHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Get All Feedback Error:", error);
      throw error;
    }
  }

  // Get feedback by ID
  static async getFeedbackById(feedbackId) {
    try {
      const url = buildApiUrl(
        API_CONFIG.ENDPOINTS.FEEDBACK_BY_ID.replace(":id", feedbackId)
      );

      const response = await fetch(url, {
        method: "GET",
        headers: buildHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Get Feedback Error:", error);
      throw error;
    }
  }

  // Update feedback status (admin only)
  static async updateFeedbackStatus(feedbackId, status) {
    try {
      const url = buildApiUrl(
        API_CONFIG.ENDPOINTS.FEEDBACK_STATUS.replace(":id", feedbackId)
      );

      const response = await fetch(url, {
        method: "PATCH",
        headers: buildHeaders(),
        body: JSON.stringify({ status }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Update Feedback Status Error:", error);
      throw error;
    }
  }

  // Add admin note (admin only)
  static async addAdminNote(feedbackId, note) {
    try {
      const url = buildApiUrl(
        API_CONFIG.ENDPOINTS.FEEDBACK_NOTES.replace(":id", feedbackId)
      );

      const response = await fetch(url, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ note }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Add Admin Note Error:", error);
      throw error;
    }
  }

  // Resolve feedback (admin only)
  static async resolveFeedback(feedbackId, resolutionNote) {
    try {
      const url = buildApiUrl(
        API_CONFIG.ENDPOINTS.FEEDBACK_RESOLVE.replace(":id", feedbackId)
      );

      const response = await fetch(url, {
        method: "PATCH",
        headers: buildHeaders(),
        body: JSON.stringify({ resolutionNote }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Resolve Feedback Error:", error);
      throw error;
    }
  }

  // Vote on feedback
  static async voteFeedback(feedbackId, voteType) {
    try {
      const url = buildApiUrl(
        API_CONFIG.ENDPOINTS.FEEDBACK_VOTE.replace(":id", feedbackId)
      );

      const response = await fetch(url, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ voteType }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Vote Feedback Error:", error);
      throw error;
    }
  }

  // Remove vote from feedback
  static async removeVote(feedbackId) {
    try {
      const url = buildApiUrl(
        API_CONFIG.ENDPOINTS.FEEDBACK_VOTE.replace(":id", feedbackId)
      );

      const response = await fetch(url, {
        method: "DELETE",
        headers: buildHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Remove Vote Error:", error);
      throw error;
    }
  }

  // Get feedback statistics (admin only)
  static async getFeedbackStats() {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.FEEDBACK_STATS);

      const response = await fetch(url, {
        method: "GET",
        headers: buildHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Get Feedback Stats Error:", error);
      throw error;
    }
  }

  // Delete feedback
  static async deleteFeedback(feedbackId) {
    try {
      const url = buildApiUrl(
        API_CONFIG.ENDPOINTS.FEEDBACK_BY_ID.replace(":id", feedbackId)
      );

      const response = await fetch(url, {
        method: "DELETE",
        headers: buildHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Delete Feedback Error:", error);
      throw error;
    }
  }

  // Helper method to get browser info for feedback submission
  static getBrowserInfo() {
    const userAgent = navigator.userAgent;

    return {
      userAgent,
      browser: this.getBrowserName(userAgent),
      version: this.getBrowserVersion(userAgent),
      os: this.getOperatingSystem(userAgent),
      screen: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    };
  }

  // Helper method to get page info for feedback submission
  static getPageInfo() {
    return {
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date(),
    };
  }

  // Helper methods for browser detection
  static getBrowserName(userAgent) {
    if (userAgent.indexOf("Chrome") > -1) return "Chrome";
    if (userAgent.indexOf("Firefox") > -1) return "Firefox";
    if (userAgent.indexOf("Safari") > -1) return "Safari";
    if (userAgent.indexOf("Edge") > -1) return "Edge";
    if (userAgent.indexOf("Opera") > -1) return "Opera";
    return "Unknown";
  }

  static getBrowserVersion(userAgent) {
    const match = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/(\d+)/);
    return match ? match[2] : "Unknown";
  }

  static getOperatingSystem(userAgent) {
    if (userAgent.indexOf("Windows") > -1) return "Windows";
    if (userAgent.indexOf("Mac") > -1) return "macOS";
    if (userAgent.indexOf("Linux") > -1) return "Linux";
    if (userAgent.indexOf("Android") > -1) return "Android";
    if (userAgent.indexOf("iOS") > -1) return "iOS";
    return "Unknown";
  }
}

// Export individual functions for easier importing
export const {
  submitFeedback,
  submitAnonymousFeedback,
  getUserFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  addAdminNote,
  resolveFeedback,
  voteFeedback,
  removeVote,
  getFeedbackStats,
  deleteFeedback,
  getBrowserInfo,
  getPageInfo,
} = FeedbackAPI;

// Default export
export default FeedbackAPI;
