// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5003/api",
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
  },
};

export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const API_BASE_URL = API_CONFIG.BASE_URL;
export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;
