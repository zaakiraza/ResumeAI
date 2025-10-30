import React, { useState } from "react";
import {
  FaQuestionCircle,
  FaEnvelope,
  FaBug,
  FaLightbulb,
  FaComments,
  FaCheckCircle,
  FaTimes,
  FaBook,
  FaVideo,
  FaHeadset,
} from "react-icons/fa";
import { useFeedback } from "../../../hooks/useFeedback";
import Footer from "../../../components/PublicComponents/footer/Footer";
import "./HelpSupport.css";

const HelpSupport = () => {
  const { submitFeedback, loading, error: apiError } = useFeedback();
  const [formData, setFormData] = useState({
    type: "question",
    category: "general",
    title: "",
    description: "",
    priority: "medium",
    contactEmail: "",
    contactPreference: "email",
  });
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [activeTab, setActiveTab] = useState("form"); // 'form', 'faq', 'resources'

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description) {
      setSubmitStatus("error");
      return;
    }

    try {
      await submitFeedback({
        type: formData.type,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        contactInfo: {
          email: formData.contactEmail,
          preferredMethod: formData.contactPreference,
        },
      });

      setSubmitStatus("success");
      // Reset form
      setFormData({
        type: "question",
        category: "general",
        title: "",
        description: "",
        priority: "medium",
        contactEmail: "",
        contactPreference: "email",
      });

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (err) {
      setSubmitStatus("error");
      console.error("Failed to submit help request:", err);
    }
  };

  const quickHelpCards = [
    {
      icon: <FaQuestionCircle />,
      title: "General Questions",
      description: "Get answers to common questions about using ResumeAI",
      type: "question",
      category: "general",
    },
    {
      icon: <FaBug />,
      title: "Report a Bug",
      description: "Found something broken? Let us know so we can fix it",
      type: "bug",
      category: "technical",
    },
    {
      icon: <FaLightbulb />,
      title: "Feature Request",
      description: "Have an idea to improve ResumeAI? Share it with us",
      type: "feature",
      category: "feature_request",
    },
    {
      icon: <FaComments />,
      title: "General Feedback",
      description: "Share your thoughts and experiences using ResumeAI",
      type: "general",
      category: "general",
    },
  ];

  const faqItems = [
    {
      question: "How do I create my first resume?",
      answer:
        'Click on "Create Resume" from your dashboard, fill in your information step by step, choose a template, and download your professional resume.',
    },
    {
      question: "Can I edit my resume after creating it?",
      answer:
        'Yes! Go to "My Resumes", find your resume, and click the edit icon. You can modify any section and save your changes.',
    },
    {
      question: "How many resume templates are available?",
      answer:
        "We offer 4 professional templates: Modern, Classic, Creative, and Minimal. Each template can be customized with your data.",
    },
    {
      question: "Can I download my resume in different formats?",
      answer:
        "Currently, you can download your resume as a PDF. We're working on adding more format options soon.",
    },
    {
      question: "How do I use the AI tools?",
      answer:
        'Navigate to "AI Tools" from your dashboard. Select the tool you need (resume optimization, cover letter generation, etc.) and follow the prompts.',
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes! We use industry-standard encryption and security measures to protect your personal information and resume data.",
    },
  ];

  const resources = [
    {
      icon: <FaBook />,
      title: "User Guide",
      description: "Comprehensive documentation on all features",
      link: "#",
    },
    {
      icon: <FaVideo />,
      title: "Video Tutorials",
      description: "Step-by-step video guides for common tasks",
      link: "#",
    },
    {
      icon: <FaHeadset />,
      title: "Contact Support",
      description: "Reach out to our support team directly",
      link: "#",
    },
  ];

  return (
    <>
      <div className="help-support-container">
        {/* Header */}
        <div className="help-support-header">
          <h1>Help & Support</h1>
          <p>We're here to help you get the most out of ResumeAI</p>
        </div>

        {/* Tabs */}
        <div className="help-support-tabs">
          <button
            className={`help-tab ${activeTab === "form" ? "active" : ""}`}
            onClick={() => setActiveTab("form")}
          >
            <FaEnvelope /> Submit Request
          </button>
          <button
            className={`help-tab ${activeTab === "faq" ? "active" : ""}`}
            onClick={() => setActiveTab("faq")}
          >
            <FaQuestionCircle /> FAQ
          </button>
          <button
            className={`help-tab ${activeTab === "resources" ? "active" : ""}`}
            onClick={() => setActiveTab("resources")}
          >
            <FaBook /> Resources
          </button>
        </div>

        {/* Content */}
        <div className="help-support-content">
          {/* Submit Request Tab */}
          {activeTab === "form" && (
            <>
              {/* Quick Help Cards */}
              <div className="quick-help-section">
                <h2>How can we help you today?</h2>
                <div className="quick-help-cards">
                  {quickHelpCards.map((card, index) => (
                    <div
                      key={index}
                      className="quick-help-card"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          type: card.type,
                          category: card.category,
                        }));
                        document
                          .getElementById("help-form")
                          .scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <div className="card-icon">{card.icon}</div>
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help Form */}
              <div className="help-form-section" id="help-form">
                <h2>Submit a Help Request</h2>

                {/* Success Message */}
                {submitStatus === "success" && (
                  <div className="submit-message success">
                    <FaCheckCircle />
                    <div>
                      <h4>Request Submitted Successfully!</h4>
                      <p>
                        We've received your help request and will get back to
                        you soon.
                      </p>
                    </div>
                    <button onClick={() => setSubmitStatus(null)}>
                      <FaTimes />
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {submitStatus === "error" && (
                  <div className="submit-message error">
                    <FaTimes />
                    <div>
                      <h4>Submission Failed</h4>
                      <p>
                        {apiError ||
                          "Please fill in all required fields and try again."}
                      </p>
                    </div>
                    <button onClick={() => setSubmitStatus(null)}>
                      <FaTimes />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="help-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="type">Request Type *</label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="question">Question</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="general">General Feedback</option>
                        <option value="technical">Technical Issue</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="category">Category *</label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="general">General</option>
                        <option value="technical">Technical</option>
                        <option value="feature_request">Feature Request</option>
                        <option value="resume_creation">Resume Creation</option>
                        <option value="ai_tools">AI Tools</option>
                        <option value="account">Account</option>
                        <option value="billing">Billing</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="priority">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                    >
                      <option value="low">Low - General inquiry</option>
                      <option value="medium">Medium - Need help soon</option>
                      <option value="high">High - Blocking my work</option>
                      <option value="urgent">Urgent - Critical issue</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="title">Subject *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Brief summary of your issue or question"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Please provide as much detail as possible. Include steps to reproduce if reporting a bug."
                      rows="6"
                      required
                    />
                    <small className="form-hint">Minimum 20 characters</small>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="contactEmail">
                        Contact Email (Optional)
                      </label>
                      <input
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                      />
                      <small className="form-hint">
                        Leave blank to use your account email
                      </small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="contactPreference">
                        Preferred Contact Method
                      </label>
                      <select
                        id="contactPreference"
                        name="contactPreference"
                        value={formData.contactPreference}
                        onChange={handleInputChange}
                      >
                        <option value="email">Email</option>
                        <option value="in_app">In-App Notification</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() =>
                        setFormData({
                          type: "question",
                          category: "general",
                          title: "",
                          description: "",
                          priority: "medium",
                          contactEmail: "",
                          contactPreference: "email",
                        })
                      }
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* FAQ Tab */}
          {activeTab === "faq" && (
            <div className="faq-section">
              <h2>Frequently Asked Questions</h2>
              <div className="faq-list">
                {faqItems.map((item, index) => (
                  <div key={index} className="faq-item">
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === "resources" && (
            <div className="resources-section">
              <h2>Help Resources</h2>
              <div className="resources-grid">
                {resources.map((resource, index) => (
                  <div key={index} className="resource-card">
                    <div className="resource-icon">{resource.icon}</div>
                    <h3>{resource.title}</h3>
                    <p>{resource.description}</p>
                    <a href={resource.link} className="resource-link">
                      Learn More →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HelpSupport;
