import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faBug,
  faLightbulb,
  faComment,
  faPaintBrush,
  faTachometerAlt,
  faEllipsisH,
  faStar,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { useFeedback } from "../../hooks/useFeedback";
import toast from "react-hot-toast";
import "./FeedbackModal.css";

const FeedbackModal = ({ isOpen, onClose, isAnonymous = false }) => {
  const { submitFeedback, submitAnonymousFeedback, submitting } = useFeedback();
  
  const [formData, setFormData] = useState({
    type: "",
    category: "",
    title: "",
    description: "",
    priority: "medium",
    rating: null,
    contactInfo: {
      email: "",
      preferredContact: "email",
    },
  });

  const [errors, setErrors] = useState({});

  const feedbackTypes = [
    { value: "bug_report", label: "Bug Report", icon: faBug, color: "#ef4444" },
    { value: "feature_request", label: "Feature Request", icon: faLightbulb, color: "#3b82f6" },
    { value: "general", label: "General Feedback", icon: faComment, color: "#6b7280" },
    { value: "ui_ux", label: "UI/UX Issue", icon: faPaintBrush, color: "#8b5cf6" },
    { value: "performance", label: "Performance Issue", icon: faTachometerAlt, color: "#f59e0b" },
    { value: "other", label: "Other", icon: faEllipsisH, color: "#10b981" },
  ];

  const categories = [
    { value: "resume_builder", label: "Resume Builder" },
    { value: "ai_tools", label: "AI Tools" },
    { value: "templates", label: "Templates" },
    { value: "dashboard", label: "Dashboard" },
    { value: "profile", label: "Profile" },
    { value: "authentication", label: "Authentication" },
    { value: "download", label: "Download" },
    { value: "website", label: "Website" },
    { value: "general", label: "General" },
  ];

  const priorities = [
    { value: "low", label: "Low", color: "#10b981" },
    { value: "medium", label: "Medium", color: "#f59e0b" },
    { value: "high", label: "High", color: "#ef4444" },
    { value: "critical", label: "Critical", color: "#dc2626" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating: prev.rating === rating ? null : rating,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type) newErrors.type = "Please select a feedback type";
    if (!formData.category) newErrors.category = "Please select a category";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const submitFunction = isAnonymous ? submitAnonymousFeedback : submitFeedback;
      await submitFunction(formData);
      
      // Reset form
      setFormData({
        type: "",
        category: "",
        title: "",
        description: "",
        priority: "medium",
        rating: null,
        contactInfo: {
          email: "",
          preferredContact: "email",
        },
      });
      
      onClose();
      
      // Show success message (you might want to use a toast notification)
      toast.success("Thank you for your feedback! We'll review it shortly.");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  const handleClose = () => {
    setFormData({
      type: "",
      category: "",
      title: "",
      description: "",
      priority: "medium",
      rating: null,
      contactInfo: {
        email: "",
        preferredContact: "email",
      },
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="feedback-modal-overlay" onClick={handleClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-modal-header">
          <h2>
            {isAnonymous ? "Anonymous Feedback" : "Send Feedback"}
          </h2>
          <button
            className="feedback-modal-close"
            onClick={handleClose}
            aria-label="Close feedback modal"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          {/* Feedback Type */}
          <div className="form-group">
            <label className="form-label">What type of feedback is this? *</label>
            <div className="feedback-types">
              {feedbackTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`feedback-type-btn ${
                    formData.type === type.value ? "selected" : ""
                  }`}
                  onClick={() => handleInputChange({ target: { name: "type", value: type.value } })}
                >
                  <FontAwesomeIcon 
                    icon={type.icon} 
                    style={{ color: formData.type === type.value ? type.color : "#6b7280" }}
                  />
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
            {errors.type && <span className="error-text">{errors.type}</span>}
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`form-select ${errors.category ? "error" : ""}`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && <span className="error-text">{errors.category}</span>}
          </div>

          {/* Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief summary of your feedback"
              className={`form-input ${errors.title ? "error" : ""}`}
              maxLength={150}
            />
            <div className="char-count">{formData.title.length}/150</div>
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Please provide detailed information about your feedback..."
              className={`form-textarea ${errors.description ? "error" : ""}`}
              rows={5}
              maxLength={2000}
            />
            <div className="char-count">{formData.description.length}/2000</div>
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">Priority</label>
            <div className="priority-options">
              {priorities.map((priority) => (
                <label key={priority.value} className="priority-option">
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={formData.priority === priority.value}
                    onChange={handleInputChange}
                  />
                  <span 
                    className="priority-label"
                    style={{ 
                      borderColor: formData.priority === priority.value ? priority.color : "#d1d5db",
                      backgroundColor: formData.priority === priority.value ? `${priority.color}10` : "transparent"
                    }}
                  >
                    {priority.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="form-group">
            <label className="form-label">How would you rate your overall experience?</label>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${formData.rating >= star ? "filled" : ""}`}
                  onClick={() => handleRatingClick(star)}
                >
                  <FontAwesomeIcon icon={faStar} />
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info (only for non-anonymous feedback) */}
          {!isAnonymous && (
            <div className="form-group">
              <label htmlFor="contactEmail" className="form-label">Email (optional)</label>
              <input
                type="email"
                id="contactEmail"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="form-input"
              />
              <p className="form-help">We'll only use this to follow up on your feedback if needed.</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPaperPlane} />
                  Send Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;