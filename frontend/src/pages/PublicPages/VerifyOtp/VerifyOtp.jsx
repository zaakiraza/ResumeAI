import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { buildApiUrl, API_ENDPOINTS } from "../../../config/api";
import "./VerifyOtp.css";

function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  const userToken = localStorage.getItem("token");

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (index < 3 && value !== "") {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleVerify = async () => {
    if (otp.includes("")) {
      setMessage("Please enter all 4 digits.");
      return;
    }

    const otpString = otp.join("");
    setIsLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        buildApiUrl(API_ENDPOINTS.VERIFY_OTP),
        { otp: otpString },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (res.data.status) {
        setMessage("OTP verified successfully! Redirecting...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP resend request
  const handleResendOtp = async () => {
    setIsResending(true);
    setMessage("");

    try {
      const res = await axios.get(
        buildApiUrl(API_ENDPOINTS.RESEND_OTP),
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (res.data.status) {
        setMessage("OTP has been resent to your email.");
        // Clear current OTP inputs
        setOtp(["", "", "", ""]);
        document.getElementById("otp-input-0").focus();
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] !== "") {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        document.getElementById(`otp-input-${index - 1}`).focus();
      }
    } else if (e.key === " ") {
      e.preventDefault();
    } else if (e.key === "Enter") {
      handleVerify();
    }
  };

  const handlePaste = (e, index) => {
    const pastedData = e.clipboardData.getData("Text");

    if (pastedData.length === 4 && /^[0-9]+$/.test(pastedData)) {
      setOtp(pastedData.split(""));
      // Focus the last input after pasting
      document.getElementById("otp-input-3").focus();
    }
    e.preventDefault();
  };

  const getMessageClass = () => {
    if (message.includes("success") || message.includes("Redirecting")) {
      return "success";
    } else if (message.includes("resent")) {
      return "info";
    } else {
      return "error";
    }
  };

  return (
    <div className="verify-otp-background">
      <div className="verify-otp-card">
        <div className="verify-otp-header">
          <h1>Verify Your Email</h1>
          <p>
            We've sent a 4-digit verification code to your email address. 
            Please enter it below to complete your registration.
          </p>
        </div>

        <div className="otp-form">
          <div className="otp-inputs-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                className="otp-input"
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={(e) => handlePaste(e, index)}
                autoFocus={index === 0}
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>

          <button 
            className={`verify-button ${isLoading ? 'loading' : ''}`}
            onClick={handleVerify}
            disabled={isLoading || otp.includes("")}
          >
            {isLoading ? (
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
              'Verify OTP'
            )}
          </button>

          {message && (
            <div className={`message ${getMessageClass()}`}>
              {message}
            </div>
          )}

          <div className="resend-section">
            <p className="resend-text">Didn't receive the code?</p>
            <button 
              className="resend-button"
              onClick={handleResendOtp}
              disabled={isResending}
            >
              {isResending ? 'Resending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
