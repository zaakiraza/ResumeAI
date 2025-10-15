import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { buildApiUrl, API_ENDPOINTS } from "../../../config/api";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState();
  const [message, setMessage] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoadingSendOtp, setIsLoadingSendOtp] = useState(false);
  const [isLoadingReset, setIsLoadingReset] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const navigate = useNavigate();

  // Prevent page refresh/reload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your progress will be lost.";
      return "Are you sure you want to leave? Your progress will be lost.";
    };

    const handlePopState = (e) => {
      if (isOtpSent || email) {
        const confirmLeave = window.confirm(
          "Are you sure you want to leave? Your progress will be lost."
        );
        if (!confirmLeave) {
          e.preventDefault();
          window.history.pushState(null, "", window.location.pathname);
        } else {
          // Clear session data and redirect to signin
          sessionStorage.removeItem('forgotPasswordData');
          navigate('/signin', { replace: true });
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Push current state to prevent back button issues
    window.history.pushState(null, "", window.location.pathname);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOtpSent, email, navigate]);

  // Save state to sessionStorage to persist during accidental refresh
  useEffect(() => {
    if (email || isOtpSent || otpExpiresAt) {
      const forgotPasswordData = {
        email,
        isOtpSent,
        otpExpiresAt,
        timestamp: Date.now()
      };
      sessionStorage.setItem('forgotPasswordData', JSON.stringify(forgotPasswordData));
    }
  }, [email, isOtpSent, otpExpiresAt]);

  // Restore state from sessionStorage on component mount
  useEffect(() => {
    const savedData = sessionStorage.getItem('forgotPasswordData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        const now = Date.now();
        const timeDiff = now - parsedData.timestamp;
        
        // Only restore if less than 10 minutes old
        if (timeDiff < 10 * 60 * 1000) {
          setEmail(parsedData.email || "");
          setIsOtpSent(parsedData.isOtpSent || false);
          setOtpExpiresAt(parsedData.otpExpiresAt || null);
          
          if (parsedData.otpExpiresAt) {
            const expirationTime = new Date(parsedData.otpExpiresAt).getTime();
            if (now < expirationTime) {
              setMessage("Session restored. Please continue with OTP verification.");
            } else {
              setMessage("OTP has expired. Please request a new one.");
              setIsOtpSent(false);
              setOtpExpiresAt(null);
            }
          }
        } else {
          // Clear old data
          sessionStorage.removeItem('forgotPasswordData');
        }
      } catch (error) {
        console.error("Error restoring forgot password data:", error);
        sessionStorage.removeItem('forgotPasswordData');
      }
    }
  }, []);

  // Clear session data when component unmounts normally
  useEffect(() => {
    return () => {
      // Only clear if navigating away normally (not refresh)
      if (!window.performance.navigation || window.performance.navigation.type !== 1) {
        sessionStorage.removeItem('forgotPasswordData');
      }
    };
  }, []);

  // Timer effect for OTP expiration
  useEffect(() => {
    let interval;
    if (otpExpiresAt) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const expirationTime = new Date(otpExpiresAt).getTime();
        const remaining = Math.max(0, expirationTime - now);
        
        setTimeRemaining(Math.floor(remaining / 1000));
        
        if (remaining <= 0) {
          setIsOtpSent(false);
          setOtpExpiresAt(null);
          setMessage("OTP has expired. Please request a new one.");
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  const handleOtpRequest = async () => {
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setIsLoadingSendOtp(true);
    setMessage("");
    
    try {
      const response = await axios.post(
        buildApiUrl(API_ENDPOINTS.FORGOT_PASSWORD_OTP),
        {
          email: email,
        }
      );
      setMessage("OTP has been sent to your email address.");
      setIsOtpSent(true);
      setOtpExpiresAt(response.data.data.otpExpiresAt);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send OTP. Please try again.");
      setIsOtpSent(false);
    } finally {
      setIsLoadingSendOtp(false);
    }
  };

  const handleResetRequest = async () => {
    if (!email || !otp || !otpExpiresAt) {
      setMessage("Please fill in all required fields.");
      return;
    }

    if (otp.length !== 4) {
      setMessage("Please enter a valid 4-digit OTP.");
      return;
    }

    if (Date.now() > new Date(otpExpiresAt).getTime()) {
      setMessage("OTP has expired. Please request a new one.");
      return;
    }

    setIsLoadingReset(true);
    setMessage("");

    try {
      const response = await axios.post(
        buildApiUrl(API_ENDPOINTS.VERIFY_FORGOT_PASSWORD_OTP),
        { email, otp }
      );
      
      setMessage("OTP verified successfully!");
      
      const resetResponse = await axios.post(
        buildApiUrl(API_ENDPOINTS.REQUEST_PASSWORD),
        { email }
      );
      
      setMessage("Password reset link has been sent to your email. Please check your inbox.");
      
      // Clear session data and form
      sessionStorage.removeItem('forgotPasswordData');
      setOtp("");
      setEmail("");
      setOtpExpiresAt(null);
      setIsOtpSent(false);
      
      // Redirect after success
      setTimeout(() => {
        navigate("/signin", { replace: true });
      }, 3000);
      
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to verify OTP. Please try again.");
    } finally {
      setIsLoadingReset(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (message && !isOtpSent) {
      setMessage("");
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setOtp(value);
    if (message && isOtpSent) {
      setMessage("");
    }
  };

  const getMessageClass = () => {
    if (message.includes("sent") || message.includes("success") || message.includes("verified")) {
      return "success";
    } else if (message.includes("expired") || message.includes("Failed") || message.includes("valid")) {
      return "error";
    } else {
      return "info";
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="forgot-password-background">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>Forgot Password?</h1>
          <p>
            Don't worry! Enter your email address and we'll send you a verification code 
            to reset your password.
          </p>
        </div>

        <div className="forgot-password-form">
          {(isOtpSent || email) && (
            <div className="refresh-warning">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Please don't refresh this page - your progress will be saved automatically.
            </div>
          )}
          
          <div className="form-group">
            <input
              type="email"
              className={`form-input ${message && !email ? 'error' : ''}`}
              placeholder="Enter your email address"
              value={email}
              onChange={handleEmailChange}
              disabled={isOtpSent}
            />
          </div>

          {isOtpSent && (
            <div className="otp-section">
              <div className="otp-input-group">
                <input
                  type="text"
                  className="otp-input"
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength="4"
                />
                <button
                  className={`send-otp-button ${isOtpSent ? 'sent' : ''}`}
                  onClick={handleOtpRequest}
                  disabled={isLoadingSendOtp || (isOtpSent && timeRemaining > 0)}
                >
                  {isLoadingSendOtp ? (
                    "Sending..."
                  ) : isOtpSent && timeRemaining > 0 ? (
                    `Resend (${formatTime(timeRemaining)})`
                  ) : (
                    "Resend OTP"
                  )}
                </button>
              </div>
              
              {timeRemaining > 0 && (
                <div className={`otp-timer ${timeRemaining <= 30 ? 'warning' : ''}`}>
                  OTP expires in: {formatTime(timeRemaining)}
                </div>
              )}
            </div>
          )}

          {!isOtpSent && (
            <button
              className={`primary-button ${isLoadingSendOtp ? 'loading' : ''}`}
              onClick={handleOtpRequest}
              disabled={isLoadingSendOtp || !email}
            >
              {isLoadingSendOtp ? (
                <>
                  <svg 
                    className="loading-spinner" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.3"/>
                    <path 
                      d="M12 2a10 10 0 0 1 10 10" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />
                  </svg>
                  Sending OTP...
                </>
              ) : (
                'Send Verification Code'
              )}
            </button>
          )}

          {isOtpSent && (
            <button
              className={`primary-button ${isLoadingReset ? 'loading' : ''}`}
              onClick={handleResetRequest}
              disabled={isLoadingReset || !otp || otp.length !== 4}
            >
              {isLoadingReset ? (
                <>
                  <svg 
                    className="loading-spinner" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.3"/>
                    <path 
                      d="M12 2a10 10 0 0 1 10 10" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />
                  </svg>
                  Verifying...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          )}

          {message && (
            <div className={`message ${getMessageClass()}`}>
              {message}
            </div>
          )}

          <div className="back-to-signin">
            <p>
              Remember your password? <Link to="/signin">Back to Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
