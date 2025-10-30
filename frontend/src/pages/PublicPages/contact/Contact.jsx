import React, { useState } from "react";
import Footer from "../../../components/PublicComponents/footer/Footer";
import toast from "react-hot-toast";
import "./Contact.css";
import { Link } from "react-router-dom";

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    // You can add form submission logic here
    toast.success("Thank you for your message! We'll get back to you soon.");
    // Reset form
    setFormData({
      fullName: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const contactMethods = [
    {
      icon: <i className="fa-solid fa-envelope"></i>,
      title: "Email Support",
      description: "Email us for any inquiries.",
      contact: "raaza.zaakir@gmail.com",
      link: "mailto:raaza.zaakir@gmail.com",
    },
    {
      icon: <i className="fa-solid fa-phone"></i>,
      title: "Phone Support",
      description: "Call us at +92 3293271727",
      contact: "+92 3293271727",
      link: "tel:+15551234567",
    },
    {
      icon: "💬",
      title: "Live Chat",
      description: "Chat with us anytime! Our team is available to help you.",
      contact: "Available 24/7",
      link: "#chat",
    },
    {
      icon: <i className="fa-solid fa-earth-americas"></i>,
      title: "Social Media",
      description:
        "Follow us on LinkedIn, Twitter, and Facebook for updates, tips, and more.",
      contact: "Follow Us",
      link: "#social",
    },
  ];

  const socialLinks = [
    {
      name: "LinkedIn",
      icon: <i className="fa-brands fa-linkedin"></i>,
      url: "https://linkedin.com/in/zakiraza404",
      color: "#0077B5",
    },
    {
      name: "Twitter",
      icon: <i className="fa-brands fa-x-twitter"></i>,
      url: "https://twitter.com/resumeai",
      color: "#000000",
    },
    {
      name: "GitHub",
      icon: <i className="fa-brands fa-github"></i>,
      url: "https://github.com/zaakiraza",
      color: "#000000",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="contact-page-hero">
        <div className="contact-page-container">
          <div className="contact-page-hero-content">
            <h1 className="contact-page-hero-title">
              We'd Love to Hear From You!
            </h1>
            <p className="contact-page-hero-subtitle">
              Have a question or need assistance? We're here to help you every
              step of the way.
            </p>
            <div className="contact-page-hero-buttons">
              <a
                href="#contact-form"
                className="contact-page-btn contact-page-btn-primary"
              >
                Contact Us Today
              </a>
              <a
                href="#contact-info"
                className="contact-page-btn contact-page-btn-secondary"
              >
                Get In Touch
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="contact-page-info" id="contact-info">
        <div className="contact-page-container">
          <h2 className="contact-page-section-title">How to Reach Us</h2>
          <p className="contact-page-section-subtitle">
            Choose the method that works best for you - we're here to help!
          </p>
          <div className="contact-page-methods-grid">
            {contactMethods.map((method, index) => (
              <div key={index} className="contact-page-method-card">
                <div className="contact-page-method-icon">{method.icon}</div>
                <h3 className="contact-page-method-title">{method.title}</h3>
                <p className="contact-page-method-description">
                  {method.description}
                </p>
                <a href={method.link} className="contact-page-method-link">
                  {method.contact}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-page-form-section" id="contact-form">
        <div className="contact-page-container">
          <div className="contact-page-form-content">
            <div className="contact-page-form-info">
              <h2 className="contact-page-section-title heading">
                Send Us a Message
              </h2>
              <p className="contact-page-form-description">
                Fill out the form below and we'll get back to you within 24
                hours. We're committed to providing you with the best support
                possible.
              </p>
              <div className="contact-page-form-features">
                <div className="contact-page-feature">
                  <span className="contact-page-feature-icon">⚡</span>
                  <span>Quick Response</span>
                </div>
                <div className="contact-page-feature">
                  <span className="contact-page-feature-icon">🛡️</span>
                  <span>Secure & Private</span>
                </div>
                <div className="contact-page-feature">
                  <span className="contact-page-feature-icon">👥</span>
                  <span>Expert Support</span>
                </div>
              </div>
            </div>

            <form className="contact-page-form" onSubmit={handleSubmit}>
              <div className="contact-page-form-group">
                <label htmlFor="fullName" className="contact-page-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="contact-page-input"
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="contact-page-form-group">
                <label htmlFor="email" className="contact-page-label">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="contact-page-input"
                  required
                  placeholder="Enter your email address"
                />
              </div>

              <div className="contact-page-form-group">
                <label htmlFor="subject" className="contact-page-label">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="contact-page-select"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="sales">Sales Question</option>
                  <option value="billing">Billing & Pricing</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div className="contact-page-form-group">
                <label htmlFor="message" className="contact-page-label">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="contact-page-textarea"
                  required
                  placeholder="Tell us how we can help you..."
                  rows="6"
                ></textarea>
              </div>

              <button type="submit" className="contact-page-submit-btn">
                Send Message
                <span className="contact-page-btn-arrow">→</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Office Location Section */}
      {/* <section className="contact-page-location">
        <div className="contact-page-container">
          <h2 className="contact-page-section-title">Visit Our Office</h2>
          <p className="contact-page-section-subtitle">
            Come see us in person! We'd love to meet you and discuss how we can
            help with your career goals.
          </p>
          <div className="contact-page-location-content">
            <div className="contact-page-location-info">
              <div className="contact-page-address">
                <h3 className="contact-page-address-title">
                  ResumeAI Headquarters
                </h3>
                <p className="contact-page-address-text">
                  123 Resume Street
                  <br />
                  Innovation District
                  <br />
                  Tech City, TC 12345
                  <br />
                  United States
                </p>
                <div className="contact-page-office-hours">
                  <h4>Office Hours</h4>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
            <div className="contact-page-map">
              <div className="contact-page-map-placeholder">
                <div className="contact-page-map-icon"><i className="fa-solid fa-location-dot"></i></div>
                <p>Interactive Map</p>
                <small>Google Maps integration would go here</small>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* FAQ Section */}
      <section className="contact-page-faq">
        <div className="contact-page-container">
          <div className="contact-page-faq-content">
            <h2 className="contact-page-section-title">
              Still Have Questions?
            </h2>
            <p className="contact-page-faq-description">
              Check out our frequently asked questions or visit our help center
              for immediate answers to common queries.
            </p>
            <div className="contact-page-faq-buttons">
              <Link
                to="/helpSupport"
                className="contact-page-btn contact-page-btn-primary"
              >
                View FAQ
              </Link>
              <Link
                to="/helpSupport"
                className="contact-page-btn contact-page-btn-secondary"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="contact-page-social">
        <div className="contact-page-container">
          <h2 className="contact-page-section-title">Connect With Us</h2>
          <p className="contact-page-section-subtitle">
            Follow us on social media for the latest updates, career tips, and
            success stories!
          </p>
          <div className="contact-page-social-grid">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-page-social-card"
                style={{ color: social.color }}
              >
                <div className="contact-page-social-icon">{social.icon}</div>
                <span className="contact-page-social-name">{social.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="contact-page-final-cta">
        <div className="contact-page-container">
          <div className="contact-page-cta-content">
            <h2 className="contact-page-cta-title">
              Ready to get in touch with us?
            </h2>
            <p className="contact-page-cta-subtitle">
              Don't hesitate to reach out - we're here to help you succeed in
              your career journey!
            </p>
            <a
              href="#contact-form"
              className="contact-page-btn contact-page-btn-primary contact-page-btn-large"
            >
              Start a Conversation
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Contact;
