import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    try {
      // Here you would typically send the data to your backend
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  const contactMethods = [
    {
      id: 1,
      icon: <i className="fa-solid fa-envelope"></i>,
      title: "Email Support",
      description: "Get help via email",
      contact: "zaakiraza110@gmail.com",
      action: "mailto:zaakiraza110@gmail.com",
    },
    {
      id: 2,
      icon: <i className="fa-solid fa-phone"></i>,
      title: "Phone Support",
      description: "Call us directly",
      contact: "+92 329 3271727",
      action: "tel:+923293271727",
    },
    {
      id: 3,
      icon: "💬",
      title: "Live Chat",
      description: "Chat with our team",
      contact: "Available 24/7",
      action: "#",
    },
  ];

  const socialLinks = [
    {
      platform: "LinkedIn",
      icon: <i className="fa-brands fa-linkedin"></i>,
      url: "https://www.linkedin.com/in/zakiraza404/",
    },
    {
      platform: "Twitter",
      icon: <i className="fa-brands fa-twitter"></i>,
      url: "https://x.com/Raza9232",
    },
    {
      platform: "GitHub",
      icon: <i className="fa-brands fa-github"></i>,
      url: "https://github.com/zaakiraza",
    },
  ];

  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        {/* Header Section */}
        <div className="contact-header">
          <h2 className="contact-title">Need Help? We're Here to Assist!</h2>
          <p className="contact-subtitle">
            Have a question or need help with something? We're always here to
            help you every step of the way!
          </p>
        </div>

        <div className="contact-content">
          {/* Contact Methods */}
          <div className="contact-methods">
            <h3 className="methods-title">Get in Touch</h3>
            <div className="methods-grid">
              {contactMethods.map((method) => (
                <a
                  key={method.id}
                  href={method.action}
                  className="contact-method-card"
                  onClick={
                    method.id === 3
                      ? (e) => {
                          e.preventDefault();
                          // Here you would trigger your live chat widget
                          alert("Live chat feature coming soon!");
                        }
                      : undefined
                  }
                >
                  <div className="method-icon">
                    <span className="method-emoji">{method.icon}</span>
                  </div>
                  <div className="method-content">
                    <h4 className="method-title">{method.title}</h4>
                    <p className="method-description">{method.description}</p>
                    <span className="method-contact">{method.contact}</span>
                  </div>
                </a>
              ))}
            </div>

            {/* Social Media Links */}
            <div className="social-section">
              <h4 className="social-title">Follow Us</h4>
              <div className="social-links">
                {socialLinks.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    className="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Follow us on ${social.platform}`}
                  >
                    <span className="social-icon">{social.icon}</span>
                    <span className="social-name">{social.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-section">
            <h3 className="form-title">Quick Contact Form</h3>
            <p className="form-description">
              Send us a message and we'll get back to you within 24 hours.
            </p>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject" className="form-label">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature">Feature Request</option>
                  <option value="bug">Bug Report</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Tell us how we can help you..."
                  rows="5"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className={`form-submit-btn ${
                  isSubmitting ? "submitting" : ""
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="submit-spinner">⏳</span>
                    Sending Message...
                  </>
                ) : (
                  <>
                    Send Message
                    <span className="submit-arrow">→</span>
                  </>
                )}
              </button>

              {submitStatus && (
                <div className={`submit-status ${submitStatus}`}>
                  {submitStatus === "success" ? (
                    <>
                      <span className="status-icon">✅</span>
                      Thank you! Your message has been sent successfully. We'll
                      get back to you soon.
                    </>
                  ) : (
                    <>
                      <span className="status-icon">❌</span>
                      Sorry, there was an error sending your message. Please try
                      again or contact us directly.
                    </>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="contact-bottom-cta">
          <h3 className="bottom-cta-title">Still Have Questions?</h3>
          <p className="bottom-cta-description">
            Check out our FAQ section or browse our help documentation for quick
            answers.
          </p>
          <div className="bottom-cta-buttons">
            <a href="/faq" className="bottom-cta-btn primary">
              View FAQ
            </a>
            <a href="/contact" className="bottom-cta-btn secondary">
              Help Center
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
