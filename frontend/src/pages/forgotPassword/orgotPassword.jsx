import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState();
  const [message, setMessage] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleOtpRequest = async () => {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://resume-backend-roan-nu.vercel.app/api/auth/forgotPasswordOtp",
        {
          email: email,
        }
      );
      setMessage(response.data.message);
      setIsOtpSent(true);
      setTimeout(() => {
        setIsOtpSent(false);
      }, 60000);
      setOtpExpiresAt(response.data.data.otpExpiresAt);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send OTP.");
      setIsOtpSent(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetRequest = async () => {
    if (!email || !otp || !otpExpiresAt) {
      setMessage("Fields are missing.");
      return;
    }

    try {
      if (Date.now() > new Date(otpExpiresAt).getTime()) {
        setMessage("OTP has expired.");
        return;
      }
      const response = await axios.post(
        "https://resume-backend-roan-nu.vercel.app/api/auth/verifyforgotPasswordOtp",
        { email, otp }
      );
      setMessage(response.data.message);
      setOtp("");
      setEmail("");
      setOtpExpiresAt(null);

      const api = await axios.post(
        "https://resume-backend-roan-nu.vercel.app/api/auth/forgotPassword",
        {
          email,
        }
      );
      setMessage(api.data.message);
      navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to verify OTP.");
    }
  };

  return (
    <div style={styles.forgotPasswordForm}>
      <h1>Forgot Password</h1>
      <input
        type="email"
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />
      <div style={styles.otpWrapper}>
        <input
          type="number"
          maxLength={4}
          minLength={4}
          placeholder="Enter OTP"
          onChange={(e) => setOtp(e.target.value)}
          style={styles.input1}
        />
        <button
          style={styles.otpButton}
          onClick={handleOtpRequest}
          disabled={isOtpSent}
        >
          {isLoading ? (
            <span>Sending...</span>
          ) : isOtpSent ? (
            "OTP Sent"
          ) : (
            "Send OTP"
          )}
        </button>
      </div>
      <button style={styles.button} onClick={handleResetRequest}>
        Request Password Reset
      </button>
      <p style={styles.message}>{message}</p>
    </div>
  );
}

const styles = {
  forgotPasswordForm: {
    maxWidth: "30%",
    margin: "100px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  input: {
    width: "94%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  input1: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  otpWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  otpButton: {
    padding: "10px 15px",
    backgroundColor: "#008a7c",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    position: "absolute",
    right: "35.3%",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#008a7c",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
  message: {
    marginTop: "10px",
    color: "red",
  },
};

export default ForgotPassword;
