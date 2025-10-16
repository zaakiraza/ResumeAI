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
  faTimes,
  faCheck,
  faComment,
} from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../../../hooks/useUser";
import { useNotifications } from "../../../hooks/useNotifications";
import FeedbackModal from "../../feedback/FeedbackModal";
import "./DashboardNavbar.css";

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: userLoading } = useUser();
  const { 
    notifications, 
    unreadCount, 
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications
  } = useNotifications();
  console.log(notifications);
  
  // Add periodic refresh for notifications
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchNotifications]);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

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

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if unread
      if (!notification.isRead) {
        await markAsRead(notification._id);
      }
      
      // Navigate to action URL if available
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
        setIsNotificationDropdownOpen(false);
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation(); // Prevent notification click
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return faCheck;
      case 'warning': return faBell;
      case 'error': return faTimes;
      default: return faBell;
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const getInitials = (name) => {
    return getUserName().charAt(0).toUpperCase();
  };

  const getUserName = () => {
    if (userLoading) return "Loading...";
    return user?.userName || user?.firstName + " " + user?.lastName || "User";
  };

  const getUserEmail = () => {
    return user?.email || "user@example.com";
  };

  const getUserAvatar = () => {
    return user?.profilePicture || null;
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
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {isNotificationDropdownOpen && (
              <div className="notification-dropdown" role="menu">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  <div className="notification-actions">
                    <button 
                      className="refresh-btn"
                      onClick={() => fetchNotifications()}
                      title="Refresh notifications"
                    >
                      🔄
                    </button>
                    {unreadCount > 0 && (
                      <button 
                        className="mark-all-read-btn"
                        onClick={handleMarkAllAsRead}
                        title="Mark all as read"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="notification-list">
                  {notificationsLoading ? (
                    <div className="notification-loading">
                      <p>Loading notifications...</p>
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                      <div 
                        key={notification._id}
                        className={`notification-item ${notification.isRead ? 'read' : 'unread'} ${notification.type}`} 
                        role="menuitem"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="notification-icon-wrapper">
                          <FontAwesomeIcon 
                            icon={getNotificationIcon(notification.type)} 
                            className="notification-type-icon" 
                          />
                        </div>
                        <div className="notification-content">
                          <h4>{notification.title}</h4>
                          <p>{notification.message}</p>
                          <span className="notification-time">
                            {notification.timeAgo || new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          className="notification-delete-btn"
                          onClick={(e) => handleDeleteNotification(notification._id, e)}
                          title="Delete notification"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-notifications">
                      <FontAwesomeIcon icon={faBell} className="no-notifications-icon" />
                      <p>No notifications yet</p>
                      <span>You're all caught up!</span>
                    </div>
                  )}
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

          {/* Feedback Button */}
          <button
            className="feedback-btn"
            onClick={() => setIsFeedbackModalOpen(true)}
            aria-label="Send feedback"
            title="Send feedback"
          >
            <FontAwesomeIcon icon={faComment} className="feedback-icon" />
          </button>

          {/* User Profile */}
          <div className="profile-container" ref={profileDropdownRef}>
            {userLoading ? (
              <div className="profile-loading">
                <div className="loading-avatar"></div>
                <div className="loading-text">Loading...</div>
              </div>
            ) : (
              <button
                className="profile-btn"
                onClick={toggleProfileDropdown}
                aria-label="User menu"
                aria-expanded={isProfileDropdownOpen}
                aria-haspopup="true"
              >
                <div className="profile-avatar">
                  {getUserAvatar() ? (
                    <img src={getUserAvatar()} alt={getUserName()} />
                  ) : (
                    <span className="avatar-initials">
                      {getInitials(getUserName())}
                    </span>
                  )}
                </div>
                <div className="profile-info">
                  <span className="profile-name">{getUserName()}</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="profile-dropdown-arrow"
                  />
                </div>
              </button>
            )}

            {isProfileDropdownOpen && (
              <div className="profile-dropdown" role="menu">
                <div className="dropdown-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {getUserAvatar() ? (
                        <img src={getUserAvatar()} alt={getUserName()} />
                      ) : (
                        <span className="avatar-initials">
                          {getInitials(getUserName())}
                        </span>
                      )}
                    </div>
                    <div className="user-details">
                      <h3>{getUserName()}</h3>
                      <p>{getUserEmail()}</p>
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
      
      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </nav>
  );
};

export default DashboardNavbar;
