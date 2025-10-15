import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { buildApiUrl, API_ENDPOINTS } from "../../../config/api";
import "./ResetPassword.css";

function ResetPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    level: "",
    score: 0,
  });
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
    }
  }, [navigate]);

  // Password strength checker
  useEffect(() => {
    if (password) {
      const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      };

      setPasswordRequirements(requirements);

      const score = Object.values(requirements).filter(Boolean).length;
      let level = "";

      if (score <= 2) level = "weak";
      else if (score <= 4) level = "medium";
      else level = "strong";

      setPasswordStrength({ level, score });
    } else {
      setPasswordStrength({ level: "", score: 0 });
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });
    }
  }, [password]);

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!oldPassword || !password || !confirmPassword) {
      setMessage("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    if (passwordStrength.score < 4) {
      setMessage(
        "Please create a stronger password that meets all requirements."
      );
      return;
    }

    if (oldPassword === password) {
      setMessage("New password must be different from your current password.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        buildApiUrl(API_ENDPOINTS.CHANGE_PASSWORD),
        {
          oldPassword: oldPassword,
          newPassword: password,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage("Password has been successfully updated!");

      // Clear form
      setOldPassword("");
      setPassword("");
      setConfirmPassword("");

      // Redirect after success
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to update password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOldPasswordChange = (e) => {
    setOldPassword(e.target.value);
    if (message) setMessage("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (message) setMessage("");
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (message) setMessage("");
  };

  const getMessageClass = () => {
    if (message.includes("successfully") || message.includes("updated")) {
      return "success";
    } else if (
      message.includes("Failed") ||
      message.includes("not match") ||
      message.includes("required")
    ) {
      return "error";
    } else {
      return "info";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength.level) {
      case "weak":
        return "Weak Password";
      case "medium":
        return "Medium Strength";
      case "strong":
        return "Strong Password";
      default:
        return "";
    }
  };

  const isFormValid = () => {
    return (
      oldPassword &&
      password &&
      confirmPassword &&
      password === confirmPassword &&
      passwordStrength.score >= 4
    );
  };

  return (
    <div className="reset-password-background">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h1>Reset Password</h1>
          <p>
            Update your password to keep your account secure. Make sure your new
            password is strong and different from your current one.
          </p>
        </div>

        <form className="reset-password-form" onSubmit={handleSubmitPassword}>
          <div className="form-group">
            <div className="password-input-container">
              <input
                type={showOldPassword ? "text" : "password"}
                className="form-input"
                placeholder="Current Password"
                value={oldPassword}
                onChange={handleOldPasswordChange}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowOldPassword(!showOldPassword)}
                aria-label={showOldPassword ? "Hide password" : "Show password"}
              >
                {showOldPassword ? (
                  <svg
                    className="eye-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="eye-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-input ${
                  password && passwordStrength.level === "strong"
                    ? "success"
                    : password && passwordStrength.level === "weak"
                    ? "error"
                    : ""
                }`}
                placeholder="New Password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    className="eye-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="eye-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {password && (
              <div className={`password-strength ${passwordStrength.level}`}>
                {getPasswordStrengthText()}
              </div>
            )}

            {password && (
              <div className="password-requirements">
                <h4>Password Requirements:</h4>
                <ul>
                  <li className={passwordRequirements.length ? "valid" : ""}>
                    <svg
                      className="requirement-icon"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    At least 8 characters
                  </li>
                  <li className={passwordRequirements.uppercase ? "valid" : ""}>
                    <svg
                      className="requirement-icon"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    One uppercase letter
                  </li>
                  <li className={passwordRequirements.lowercase ? "valid" : ""}>
                    <svg
                      className="requirement-icon"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    One lowercase letter
                  </li>
                  <li className={passwordRequirements.number ? "valid" : ""}>
                    <svg
                      className="requirement-icon"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    One number
                  </li>
                  <li className={passwordRequirements.special ? "valid" : ""}>
                    <svg
                      className="requirement-icon"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    One special character
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="form-group">
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`form-input ${
                  confirmPassword && password === confirmPassword
                    ? "success"
                    : confirmPassword && password !== confirmPassword
                    ? "error"
                    : ""
                }`}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <svg
                    className="eye-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="eye-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`submit-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? (
              <>
                <svg
                  className="loading-spinner"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    strokeWidth="2"
                    opacity="0.3"
                  />
                  <path
                    d="M12 2a10 10 0 0 1 10 10"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </button>

          {message && (
            <div className={`message ${getMessageClass()}`}>{message}</div>
          )}

          <div className="back-to-dashboard">
            <p>
              <Link to="/dashboard">← Back to Dashboard</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
