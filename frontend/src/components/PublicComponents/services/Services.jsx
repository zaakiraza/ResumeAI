import React from "react";
import "./Services.css";
import { Link } from "react-router-dom";

const Services = () => {
  const services = [
    {
      id: 1,
      title: "AI-Powered Resume Creation",
      description:
        "Let our AI generate personalized job descriptions, skills, and education sections for your resume. Save time and effort with our seamless process.",
      icon: "🧠",
      ctaText: "Get Started",
      ctaLink: "/signup",
    },
    {
      id: 2,
      title: "Real-Time Grammar Check",
      description:
        "Ensure your resume is error-free with real-time grammar and style checks. Our AI will improve your resume's clarity and professionalism.",
      icon: "✓",
      ctaText: "Learn More",
      ctaLink: "/services",
    },
    {
      id: 3,
      title: "Multilingual Support",
      description:
        "Reach a global job market by creating resumes in multiple languages. Expand your job opportunities internationally.",
      icon: "🌍",
      ctaText: "Explore More",
      ctaLink: "/services",
    },
    {
      id: 4,
      title: "Customizable Templates",
      description:
        "Choose from a variety of professionally designed templates and personalize your resume to match your style.",
      icon: "📄",
      ctaText: "See Templates",
      ctaLink: "/signin",
    },
  ];

  return (
    <section className="services-section" id="services">
      <div className="services-container">
        {/* Header Section */}
        <div className="services-header">
          <h2 className="services-title">Our Powerful Services</h2>
          <p className="services-subtitle">
            AI-driven tools that help you create professional resumes in minutes
          </p>
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">
                <span className="icon-emoji">{service.icon}</span>
              </div>

              <div className="service-content">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>

              <div className="service-footer">
                <Link to={service.ctaLink} className="service-cta">
                  {service.ctaText}
                  <span className="cta-arrow">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Main CTA Section */}
        <div className="services-main-cta">
          <h3 className="main-cta-title">
            Ready to Transform Your Job Search?
          </h3>
          <p className="main-cta-description">
            Join thousands of professionals who have boosted their careers with
            our AI-powered resume tools.
          </p>
          <div className="main-cta-buttons">
            <Link to="/signup" className="main-cta-btn primary">
              Start Building Your Resume
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/services" className="main-cta-btn secondary">
              Explore All Features
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
