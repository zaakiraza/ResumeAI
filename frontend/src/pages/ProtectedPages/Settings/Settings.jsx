import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaLock,
  FaPalette,
  FaUser,
  FaBell,
  FaShieldAlt,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import "./Settings.css";

const Settings = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem("notifications") !== "false";
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleNotificationToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem("notifications", newValue.toString());
  };

  const handleGoToHome = () => {
    navigate("/home");
  };

  const settingsOptions = [
    {
      id: "account",
      icon: <FaUser />,
      title: "Account Settings",
      description: "Manage your account information and preferences",
      action: () => navigate("/profile"),
    },
    {
      id: "password",
      icon: <FaLock />,
      title: "Change Password",
      description: "Update your password to keep your account secure",
      action: () => navigate("/resetPassword"),
    },
    {
      id: "theme",
      icon: <FaPalette />,
      title: "Theme",
      description: "Customize the appearance of your dashboard",
      component: "theme",
    },
    {
      id: "notifications",
      icon: <FaBell />,
      title: "Notifications",
      description: "Manage your notification preferences",
      component: "notifications",
    },
    {
      id: "security",
      icon: <FaShieldAlt />,
      title: "Security & Privacy",
      description: "Control your security and privacy settings",
      action: () => alert("Security settings coming soon!"),
    },
    {
      id: "home",
      icon: <FaHome />,
      title: "Go to Home Page",
      description: "Return to the main landing page",
      action: handleGoToHome,
    },
  ];

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-grid">
        {settingsOptions.map((option) => (
          <div key={option.id} className="settings-card">
            <div className="settings-card-icon">{option.icon}</div>
            <div className="settings-card-content">
              <h3>{option.title}</h3>
              <p>{option.description}</p>

              {option.component === "theme" && (
                <div className="theme-selector">
                  <button
                    className={`theme-btn ${theme === "light" ? "active" : ""}`}
                    onClick={() => handleThemeChange("light")}
                  >
                    <FaSun /> Light
                  </button>
                  <button
                    className={`theme-btn ${theme === "dark" ? "active" : ""}`}
                    onClick={() => handleThemeChange("dark")}
                  >
                    <FaMoon /> Dark
                  </button>
                </div>
              )}

              {option.component === "notifications" && (
                <div className="notification-toggle">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={handleNotificationToggle}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-label">
                    {notifications ? "Enabled" : "Disabled"}
                  </span>
                </div>
              )}

              {option.action && !option.component && (
                <button className="settings-action-btn" onClick={option.action}>
                  Open
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
