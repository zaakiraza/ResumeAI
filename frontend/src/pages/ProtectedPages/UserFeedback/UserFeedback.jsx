import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faThumbsUp,
  faThumbsDown,
  faFilter,
  faSearch,
  faCalendarAlt,
  faSort,
  faBug,
  faLightbulb,
  faPaintBrush,
  faTachometerAlt,
  faEllipsisH,
  faStar,
  faEye,
  faCheck,
  faClock,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { useFeedback } from "../../../hooks/useFeedback";
import FeedbackModal from "../../../components/feedback/FeedbackModal";
import "./UserFeedback.css";

const UserFeedback = () => {
  const {
    userFeedback,
    loading,
    error,
    fetchUserFeedback,
    voteFeedback,
  } = useFeedback();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  useEffect(() => {
    fetchUserFeedback();
  }, [fetchUserFeedback]);

  const typeIcons = {
    bug_report: { icon: faBug, color: "#ef4444", label: "Bug Report" },
    feature_request: { icon: faLightbulb, color: "#3b82f6", label: "Feature Request" },
    general: { icon: faComment, color: "#6b7280", label: "General Feedback" },
    ui_ux: { icon: faPaintBrush, color: "#8b5cf6", label: "UI/UX Issue" },
    performance: { icon: faTachometerAlt, color: "#f59e0b", label: "Performance Issue" },
    other: { icon: faEllipsisH, color: "#10b981", label: "Other" },
  };

  const statusIcons = {
    pending: { icon: faClock, color: "#f59e0b", label: "Pending" },
    in_review: { icon: faEye, color: "#3b82f6", label: "In Review" },
    resolved: { icon: faCheck, color: "#10b981", label: "Resolved" },
    rejected: { icon: faExclamationTriangle, color: "#ef4444", label: "Rejected" },
  };

  const priorityColors = {
    low: "#10b981",
    medium: "#f59e0b",
    high: "#ef4444",
    critical: "#dc2626",
  };

  const filteredFeedback = userFeedback
    .filter((feedback) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !feedback.title.toLowerCase().includes(searchLower) &&
          !feedback.description.toLowerCase().includes(searchLower) &&
          !feedback.category.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Type filter
      if (filterType !== "all" && feedback.type !== filterType) {
        return false;
      }

      // Status filter
      if (filterStatus !== "all" && feedback.status !== filterStatus) {
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
        case "status":
          return a.status.localeCompare(b.status);
        case "type":
          return a.type.localeCompare(b.type);
        case "priority":
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "votes":
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        default:
          return 0;
      }
    });

  const handleVote = async (feedbackId, voteType) => {
    try {
      await voteFeedback(feedbackId, voteType);
    } catch (error) {
      console.error("Error voting on feedback:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FontAwesomeIcon
        key={index}
        icon={faStar}
        className={`star ${index < rating ? "filled" : ""}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="user-feedback-page">
        <div className="feedback-loading">
          <div className="spinner"></div>
          <p>Loading your feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-feedback-page">
      <div className="feedback-header">
        <div className="feedback-title">
          <FontAwesomeIcon icon={faComment} />
          <h1>My Feedback</h1>
        </div>

        <button
          className="btn-primary"
          onClick={() => setIsFeedbackModalOpen(true)}
        >
          <FontAwesomeIcon icon={faComment} />
          New Feedback
        </button>
      </div>

      {error && (
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="feedback-stats">
        <div className="stat-card">
          <div className="stat-value">{userFeedback.length}</div>
          <div className="stat-label">Total Feedback</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {userFeedback.filter(f => f.status === "pending").length}
          </div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {userFeedback.filter(f => f.status === "resolved").length}
          </div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {userFeedback.reduce((total, f) => total + f.upvotes, 0)}
          </div>
          <div className="stat-label">Total Upvotes</div>
        </div>
      </div>

      {/* Filters */}
      <div className="feedback-filters">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search feedback..."
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
            <option value="bug_report">Bug Report</option>
            <option value="feature_request">Feature Request</option>
            <option value="general">General</option>
            <option value="ui_ux">UI/UX</option>
            <option value="performance">Performance</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="status">By Status</option>
            <option value="type">By Type</option>
            <option value="priority">By Priority</option>
            <option value="votes">By Votes</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="feedback-list">
        {filteredFeedback.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faComment} />
            <h3>No feedback found</h3>
            <p>
              {searchTerm || filterType !== "all" || filterStatus !== "all"
                ? "Try adjusting your filters or search terms."
                : "You haven't submitted any feedback yet. Share your thoughts to help us improve!"}
            </p>
            {!searchTerm && filterType === "all" && filterStatus === "all" && (
              <button
                className="btn-primary"
                onClick={() => setIsFeedbackModalOpen(true)}
              >
                Submit Your First Feedback
              </button>
            )}
          </div>
        ) : (
          filteredFeedback.map((feedback) => {
            const typeConfig = typeIcons[feedback.type];
            const statusConfig = statusIcons[feedback.status];
            
            return (
              <div key={feedback._id} className="feedback-item">
                <div className="feedback-item-header">
                  <div className="feedback-meta">
                    <div className="feedback-type">
                      <FontAwesomeIcon
                        icon={typeConfig.icon}
                        style={{ color: typeConfig.color }}
                      />
                      <span>{typeConfig.label}</span>
                    </div>
                    <div 
                      className="feedback-priority"
                      style={{ color: priorityColors[feedback.priority] }}
                    >
                      {feedback.priority.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="feedback-status">
                    <FontAwesomeIcon
                      icon={statusConfig.icon}
                      style={{ color: statusConfig.color }}
                    />
                    <span>{statusConfig.label}</span>
                  </div>
                </div>

                <div className="feedback-content">
                  <h3 className="feedback-title">{feedback.title}</h3>
                  <p className="feedback-description">{feedback.description}</p>
                  
                  <div className="feedback-details">
                    <div className="feedback-category">
                      <strong>Category:</strong> {feedback.category.replace('_', ' ')}
                    </div>
                    
                    {feedback.rating && (
                      <div className="feedback-rating">
                        <strong>Rating:</strong>
                        <div className="stars">
                          {renderStars(feedback.rating)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="feedback-footer">
                  <div className="feedback-date">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    {formatDate(feedback.createdAt)}
                  </div>

                  <div className="feedback-votes">
                    <button
                      className={`vote-btn upvote ${feedback.userVote === 'upvote' ? 'active' : ''}`}
                      onClick={() => handleVote(feedback._id, 'upvote')}
                      title="Upvote this feedback"
                    >
                      <FontAwesomeIcon icon={faThumbsUp} />
                      <span>{feedback.upvotes}</span>
                    </button>
                    
                    <button
                      className={`vote-btn downvote ${feedback.userVote === 'downvote' ? 'active' : ''}`}
                      onClick={() => handleVote(feedback._id, 'downvote')}
                      title="Downvote this feedback"
                    >
                      <FontAwesomeIcon icon={faThumbsDown} />
                      <span>{feedback.downvotes}</span>
                    </button>
                  </div>
                </div>

                {feedback.adminResponse && (
                  <div className="admin-response">
                    <h4>Admin Response:</h4>
                    <p>{feedback.adminResponse}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
};

export default UserFeedback;