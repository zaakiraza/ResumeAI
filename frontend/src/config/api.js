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
    RESUME_DRAFT: "/resumes/:id/draft",
    RESUME_NEW_DRAFT: "/resumes/draft",
    RESUME_TEMPLATES: "/resumes/templates",
  },
};

export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const API_BASE_URL = API_CONFIG.BASE_URL;
export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;
