import React from "react";
import "./AboutUs.css";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Content Generation",
      description:
        "Automatically generate job descriptions, skills, and education sections with our advanced AI technology.",
      highlight: "Smart & Fast",
    },
    {
      icon: "✓",
      title: "Real-Time Grammar Checks",
      description:
        "Ensure your resume is error-free and professional with our intelligent proofreading system.",
      highlight: "Error-Free",
    },
    {
      icon: "🌍",
      title: "Multilingual Support",
      description:
        "Generate resumes in multiple languages to apply globally and reach international opportunities.",
      highlight: "Global Reach",
    },
  ];

  const stats = [
    { number: "10K+", label: "Resumes Created" },
    { number: "50+", label: "Languages Supported" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "AI Support" },
  ];

  return (
    <section className="about-us" id="about">
      <div className="container">
        {/* Hero Section */}
        <div className="about-hero">
          <div className="about-content">
            <div className="section-badge">
              <span className="badge-text">About ResumeAI</span>
            </div>

            <h1 className="about-title">
              Create Your Perfect Resume with{" "}
              <span className="highlight-text">AI in Minutes</span>
            </h1>

            <div className="about-description">
              <p className="description-text">
                ResumeAI leverages cutting-edge AI to help you create standout
                resumes quickly and easily. Whether you're just starting your
                career or looking to level up, our platform streamlines the
                process of resume creation.
              </p>

              <p className="description-text">
                Simply input your details, and let our AI generate personalized
                content, proofread for grammar, and even customize the design to
                reflect your professional image.
              </p>
            </div>

            <div className="cta-section">
              <p className="cta-text">Ready to build your perfect resume?</p>
              <Link to="/signup" className="about-cta-btn">
                Get Started
                <span className="cta-arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="about-visual">
            <div className="visual-card">
              <div className="card-header">
                <div className="card-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="card-title">ResumeAI Dashboard</div>
              </div>
              <div className="card-content">
                <div className="mock-content">
                  <div className="mock-line long"></div>
                  <div className="mock-line medium"></div>
                  <div className="mock-line short"></div>
                  <div className="mock-highlight"></div>
                  <div className="mock-line medium"></div>
                  <div className="mock-line long"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h2 className="features-title">
            Powerful Features for Professional Results
          </h2>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon-container">
                  <span className="feature-icon">{feature.icon}</span>
                  <div className="feature-badge">{feature.highlight}</div>
                </div>

                <div className="feature-content">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>

                <div className="feature-hover-effect"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <h2 className="stats-title">Trusted by Professionals Worldwide</h2>

          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-line"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Process Section */}
        <div className="process-section">
          <h2 className="process-title">How It Works</h2>

          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Input Your Details</h3>
                <p className="step-description">
                  Simply provide your basic information, work experience, and
                  career goals.
                </p>
              </div>
            </div>

            <div className="step-connector"></div>

            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">AI Magic Happens</h3>
                <p className="step-description">
                  Our AI generates compelling content, checks grammar, and
                  optimizes your resume.
                </p>
              </div>
            </div>

            <div className="step-connector"></div>

            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Download & Apply</h3>
                <p className="step-description">
                  Get your polished, professional resume ready to impress
                  employers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
