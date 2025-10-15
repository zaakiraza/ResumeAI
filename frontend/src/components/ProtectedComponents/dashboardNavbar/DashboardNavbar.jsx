import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faFileAlt,
  faRobot,
  faBell,
  faChevronDown,
  faUser,
  faCog,
  faQuestionCircle,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./DashboardNavbar.css";

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: null,
  });

  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setIsProfileDropdownOpen(false);
    setIsNotificationDropdownOpen(false);
  }, [location]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setIsNotificationDropdownOpen(false);
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    setIsProfileDropdownOpen(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav
      className="dashboard-navbar"
      role="navigation"
      aria-label="Dashboard navigation"
    >
      <div className="dashboard-navbar-container">
        {/* Logo Section */}
        <div className="dashboard-logo">
          <h1
            onClick={() => handleNavigation("/dashboard")}
            tabIndex="0"
            onKeyDown={(e) =>
              e.key === "Enter" && handleNavigation("/dashboard")
            }
          >
            ResumeAI
          </h1>
        </div>

        {/* Navigation Items */}
        <ul className="dashboard-nav-items" role="menubar">
          <li role="none">
            <button
              className={`dashboard-nav-link ${
                isActiveRoute("/dashboard") ? "active" : ""
              }`}
              onClick={() => handleNavigation("/dashboard")}
              role="menuitem"
              aria-current={isActiveRoute("/dashboard") ? "page" : undefined}
            >
              <FontAwesomeIcon icon={faHome} className="nav-icon" />
              <span className="nav-text">Home</span>
            </button>
          </li>
          <li role="none">
            <button
              className={`dashboard-nav-link ${
                isActiveRoute("/my-resumes") ? "active" : ""
              }`}
              onClick={() => handleNavigation("/my-resumes")}
              role="menuitem"
              aria-current={isActiveRoute("/my-resumes") ? "page" : undefined}
            >
              <FontAwesomeIcon icon={faFileAlt} className="nav-icon" />
              <span className="nav-text">My Resumes</span>
            </button>
          </li>
          <li role="none">
            <button
              className={`dashboard-nav-link ${
                isActiveRoute("/ai-tools") ? "active" : ""
              }`}
              onClick={() => handleNavigation("/ai-tools")}
              role="menuitem"
              aria-current={isActiveRoute("/ai-tools") ? "page" : undefined}
            >
              <FontAwesomeIcon icon={faRobot} className="nav-icon" />
              <span className="nav-text">AI Tools</span>
            </button>
          </li>
        </ul>

        {/* Right Section - Notifications & Profile */}
        <div className="dashboard-navbar-right">
          {/* Notifications */}
          <div className="notification-container" ref={notificationDropdownRef}>
            <button
              className="notification-btn"
              onClick={toggleNotificationDropdown}
              aria-label="Notifications"
              aria-expanded={isNotificationDropdownOpen}
              aria-haspopup="true"
            >
              <FontAwesomeIcon icon={faBell} className="notification-icon" />
              {/* <span className="notification-badge">3</span> */}
            </button>

            {isNotificationDropdownOpen && (
              <div className="notification-dropdown" role="menu">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                </div>
                <div className="notification-list">
                  <div className="notification-item" role="menuitem">
                    <div className="notification-content">
                      <h4>Resume Updated</h4>
                      <p>
                        Your resume "Software Developer" was successfully
                        updated.
                      </p>
                      <span className="notification-time">2 hours ago</span>
                    </div>
                  </div>
                  <div className="notification-item" role="menuitem">
                    <div className="notification-content">
                      <h4>AI Analysis Complete</h4>
                      <p>Your resume analysis is ready for review.</p>
                      <span className="notification-time">4 hours ago</span>
                    </div>
                  </div>
                  <div className="notification-item" role="menuitem">
                    <div className="notification-content">
                      <h4>Welcome to ResumeAI</h4>
                      <p>
                        Complete your profile to get personalized
                        recommendations.
                      </p>
                      <span className="notification-time">1 day ago</span>
                    </div>
                  </div>
                </div>
                <div className="dropdown-footer">
                  <button
                    className="view-all-btn"
                    onClick={() => navigate("/notifications")}
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="profile-container" ref={profileDropdownRef}>
            <button
              className="profile-btn"
              onClick={toggleProfileDropdown}
              aria-label="User menu"
              aria-expanded={isProfileDropdownOpen}
              aria-haspopup="true"
            >
              <div className="profile-avatar">
                {userData.avatar ? (
                  <img src={userData.avatar} alt={userData.name} />
                ) : (
                  <span className="avatar-initials">
                    {getInitials(userData.name)}
                  </span>
                )}
              </div>
              <div className="profile-info">
                <span className="profile-name">{userData.name}</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="profile-dropdown-arrow"
                />
              </div>
            </button>

            {isProfileDropdownOpen && (
              <div className="profile-dropdown" role="menu">
                <div className="dropdown-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {userData.avatar ? (
                        <img src={userData.avatar} alt={userData.name} />
                      ) : (
                        <span className="avatar-initials">
                          {getInitials(userData.name)}
                        </span>
                      )}
                    </div>
                    <div className="user-details">
                      <h3>{userData.name}</h3>
                      <p>{userData.email}</p>
                    </div>
                  </div>
                </div>
                <div className="dropdown-menu">
                  <button
                    className="dropdown-item"
                    onClick={() => handleNavigation("/profile")}
                    role="menuitem"
                  >
                    <FontAwesomeIcon icon={faUser} className="dropdown-icon" />
                    My Profile
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => handleNavigation("/settings")}
                    role="menuitem"
                  >
                    <FontAwesomeIcon icon={faCog} className="dropdown-icon" />
                    Settings
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => handleNavigation("/helpSupport")}
                    role="menuitem"
                  >
                    <FontAwesomeIcon
                      icon={faQuestionCircle}
                      className="dropdown-icon"
                    />
                    Help & Support
                  </button>
                  <hr className="dropdown-divider" />
                  <button
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <FontAwesomeIcon
                      icon={faSignOutAlt}
                      className="dropdown-icon"
                    />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
