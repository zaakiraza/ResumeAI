// API Configuration
export const API_CONFIG = {
  // BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5003/api",
    BASE_URL:
      import.meta.env.VITE_API_BASE_URL ||
      "https://resume-backend-roan-nu.vercel.app/api",
  ENDPOINTS: {
    // Authentication endpoints
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    VERIFY_OTP: "/auth/verifyOtp",
    RESEND_OTP: "/auth/resendOtp",
    FORGOT_PASSWORD_OTP: "/auth/forgotPasswordOtp",
    VERIFY_FORGOT_PASSWORD_OTP: "/auth/verifyforgotPasswordOtp",
    REQUEST_PASSWORD: "/auth/requestPassword",
    CHANGE_PASSWORD: "/auth/changePassword",

    // User endpoints
    GET_USER: "/users/profile",
    UPDATE_USER: "/users/profile",
    USER_ANALYTICS: "/users/analytics",

    // Resume endpoints
    RESUMES: "/resumes",
    RESUME_BY_ID: "/resumes/:id",
    RESUME_DUPLICATE: "/resumes/:id/duplicate",
    RESUME_STATUS: "/resumes/:id/status",
    RESUME_DOWNLOAD: "/resumes/:id/download",
    RESUME_PDF: "/resumes/:id/pdf",
    RESUME_PDF_URL: "/resumes/:id/pdf-url",
    RESUME_DRAFT: "/resumes/:id/draft",
    RESUME_NEW_DRAFT: "/resumes/draft",
    RESUME_TEMPLATES: "/resumes/templates",

    // Notification endpoints
    NOTIFICATIONS: "/notifications",
    NOTIFICATION_BY_ID: "/notifications/:id",
    NOTIFICATION_MARK_READ: "/notifications/:id/read",
    NOTIFICATION_MARK_UNREAD: "/notifications/:id/unread",
    NOTIFICATION_MARK_ALL_READ: "/notifications/mark-all-read",
    NOTIFICATION_DELETE_READ: "/notifications/read",
    NOTIFICATION_DELETE_ALL: "/notifications/all",
    NOTIFICATION_STATS: "/notifications/stats",
    NOTIFICATION_PREFERENCES: "/notifications/preferences",

    // Feedback endpoints
    FEEDBACK: "/feedback",
    FEEDBACK_ANONYMOUS: "/feedback/anonymous",
    FEEDBACK_USER: "/feedback/user",
    FEEDBACK_BY_ID: "/feedback/:id",
    FEEDBACK_VOTE: "/feedback/:id/vote",
    FEEDBACK_STATS: "/feedback/stats/overview",
    FEEDBACK_STATUS: "/feedback/:id/status",
    FEEDBACK_NOTES: "/feedback/:id/notes",
    FEEDBACK_RESOLVE: "/feedback/:id/resolve",

    // Skill endpoints
    SKILLS: "/skills",
    SKILL_SUGGESTIONS: "/skills/suggestions",
    SKILL_POPULAR: "/skills/popular",
    SKILL_BY_CATEGORY: "/skills/by-category",
    SKILL_ADD: "/skills/add",
    SKILL_BATCH: "/skills/batch",
    SKILL_VERIFY: "/skills/:id/verify",
    SKILL_UPDATE_CATEGORY: "/skills/:id/category",

    // Contact endpoint
    CONTACT: "/contact",

    // Newsletter endpoints
    NEWSLETTER_SUBSCRIBE: "/newsletter/subscribe",
    NEWSLETTER_UNSUBSCRIBE: "/newsletter/unsubscribe",
    NEWSLETTER_STATS: "/newsletter/stats",
  },
};

export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const API_BASE_URL = API_CONFIG.BASE_URL;
export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;
