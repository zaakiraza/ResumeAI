import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheck,
  faTrash,
  faEye,
  faEyeSlash,
  faFilter,
  faSearch,
  faCheckDouble,
  faInfoCircle,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faSort,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useNotifications } from "../../../hooks/useNotifications";
import "./Notifications.css";

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const typeIcons = {
    info: { icon: faInfoCircle, color: "#3b82f6" },
    success: { icon: faCheckCircle, color: "#10b981" },
    warning: { icon: faExclamationTriangle, color: "#f59e0b" },
    error: { icon: faTimesCircle, color: "#ef4444" },
  };

  const filteredNotifications = notifications
    .filter((notification) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !notification.title.toLowerCase().includes(searchLower) &&
          !notification.message.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Type filter
      if (filterType !== "all" && notification.type !== filterType) {
        return false;
      }

      // Status filter
      if (filterStatus === "read" && !notification.isRead) {
        return false;
      }
      if (filterStatus === "unread" && notification.isRead) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "unread":
          if (a.isRead === b.isRead) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return a.isRead ? 1 : -1;
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n._id));
    }
  };

  const handleBulkMarkAsRead = async () => {
    try {
      await Promise.all(
        selectedNotifications.map((id) => {
          const notification = notifications.find((n) => n._id === id);
          if (notification && !notification.isRead) {
            return markAsRead(id);
          }
        })
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedNotifications.map((id) => deleteNotification(id))
      );
      setSelectedNotifications([]);
      setShowDeleteConfirm(false);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Handle navigation if notification has action data
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="notifications-page">
        <div className="notifications-loading">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="notifications-title">
          <FontAwesomeIcon icon={faBell} />
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>

        <div className="notifications-actions">
          {unreadCount > 0 && (
            <button
              className="btn-action"
              onClick={markAllAsRead}
              title="Mark all as read"
            >
              <FontAwesomeIcon icon={faCheckDouble} />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              className="btn-action btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete all notifications"
            >
              <FontAwesomeIcon icon={faTrash} />
              Clear all
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <FontAwesomeIcon icon={faTimesCircle} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters and Search */}
      <div className="notifications-filters">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="unread">Unread First</option>
            <option value="type">By Type</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-info">
            <input
              type="checkbox"
              checked={selectedNotifications.length === filteredNotifications.length}
              onChange={handleSelectAll}
            />
            <span>{selectedNotifications.length} selected</span>
          </div>
          <div className="bulk-buttons">
            <button
              className="btn-bulk"
              onClick={handleBulkMarkAsRead}
            >
              <FontAwesomeIcon icon={faCheck} />
              Mark as read
            </button>
            <button
              className="btn-bulk btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <FontAwesomeIcon icon={faTrash} />
              Delete selected
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faBell} />
            <h3>No notifications found</h3>
            <p>
              {searchTerm || filterType !== "all" || filterStatus !== "all"
                ? "Try adjusting your filters or search terms."
                : "You're all caught up! New notifications will appear here."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const typeConfig = typeIcons[notification.type] || typeIcons.info;
            return (
              <div
                key={notification._id}
                className={`notification-item ${
                  notification.isRead ? "read" : "unread"
                } ${selectedNotifications.includes(notification._id) ? "selected" : ""}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-select">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectNotification(notification._id);
                    }}
                  />
                </div>

                <div className="notification-icon">
                  <FontAwesomeIcon
                    icon={typeConfig.icon}
                    style={{ color: typeConfig.color }}
                  />
                </div>

                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className="notification-date">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  {notification.actionText && (
                    <span className="notification-action">{notification.actionText}</span>
                  )}
                </div>

                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification._id);
                      }}
                      title="Mark as read"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  )}
                  <button
                    className="action-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                    title="Delete notification"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p>
              {selectedNotifications.length > 0
                ? `Are you sure you want to delete ${selectedNotifications.length} selected notification${selectedNotifications.length !== 1 ? "s" : ""}?`
                : "Are you sure you want to delete all notifications?"}
            </p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={
                  selectedNotifications.length > 0
                    ? handleBulkDelete
                    : deleteAllNotifications
                }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
