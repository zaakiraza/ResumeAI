export const GOOGLE_OAUTH_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  scopes: ["profile", "email"],
  endpoints: {
    auth: "/auth/google",
    callback: "/auth/callback",
    signin: "/auth/google/signin",
  },
};

export const validateOAuthConfig = () => {
  const errors = [];

  if (!GOOGLE_OAUTH_CONFIG.clientId) {
    errors.push("VITE_GOOGLE_CLIENT_ID environment variable is not set");
  }

  if (!import.meta.env.VITE_API_URL) {
    errors.push("VITE_API_URL environment variable is not set");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const isOAuthConfigured = () => {
  return validateOAuthConfig().isValid;
};

export const getOAuthRedirectUrl = (provider = "google") => {
  const baseUrl = import.meta.env.VITE_API_URL || "https://resume-backend-roan-nu.vercel.app/api";

  if (!baseUrl) {
    throw new Error("API URL not configured");
  }

  switch (provider) {
    case "google":
      const oauthUrl = `${baseUrl}/auth/google`;
      return oauthUrl;
    default:
      throw new Error(`OAuth provider '${provider}' not supported`);
  }
};

export const OAUTH_ERROR_MESSAGES = {
  CONFIGURATION_ERROR:
    "OAuth is not properly configured. Please contact support.",
  AUTHENTICATION_FAILED: "Authentication failed. Please try again.",
  INVALID_CALLBACK:
    "Invalid authentication callback. Please try logging in again.",
  NETWORK_ERROR:
    "Network error occurred. Please check your connection and try again.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
};

export const handleOAuthConfigError = (toast) => {
  const validation = validateOAuthConfig();

  if (!validation.isValid) {
    if (toast) {
      toast({
        title: "Configuration Error",
        description: OAUTH_ERROR_MESSAGES.CONFIGURATION_ERROR,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }

    return false;
  }

  return true;
};

export default GOOGLE_OAUTH_CONFIG;
