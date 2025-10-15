import React, { useState } from "react";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState(null);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);

    // Simulate newsletter subscription
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubscribeStatus("success");
      setEmail("");
    } catch (error) {
      setSubscribeStatus("error");
    } finally {
      setIsSubscribing(false);
      setTimeout(() => setSubscribeStatus(null), 4000);
    }
  };

  const navigationLinks = {
    company: [
      { name: "About Us", href: "/about" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms & Conditions", href: "/terms" },
    ],
    support: [
      { name: "Contact Us", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Help Center", href: "/contact" },
    ],
    quickLinks: [
      { name: "Services", href: "/services" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
    ],
  };

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
    <footer className="footer-section">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="brand-logo">
              <h3 className="brand-name">ResumeAI</h3>
              <span className="brand-icon">🚀</span>
            </div>
            <p className="brand-tagline">
              Create Professional Resumes in Minutes with AI
            </p>
            <p className="brand-description">
              Transform your job search with our AI-powered resume creation
              tools. Join thousands of professionals who have boosted their
              careers with ResumeAI.
            </p>

            {/* Contact Info */}
            <div className="footer-contact">
              <div className="contact-item">
                <span className="contact-icon">
                  <i className="fa-solid fa-envelope"></i>
                </span>
                <a
                  href="mailto:zaakiraza110@gmail.com"
                  className="contact-link"
                >
                  zaakiraza110@gmail.com
                </a>
              </div>
              <div className="contact-item">
                <span className="contact-icon">
                  <i className="fa-solid fa-phone"></i>
                </span>
                <a href="tel:+923293271727" className="contact-link">
                  +92 329 3271727
                </a>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="footer-social">
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
                    style={{ "--social-color": social.color }}
                  >
                    <span className="social-icon">{social.icon}</span>
                    <span className="social-name">{social.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="footer-navigation">
            {/* Company Links */}
            <div className="nav-column">
              <h4 className="nav-title">Company</h4>
              <ul className="nav-list">
                {navigationLinks.company.map((link) => (
                  <li key={link.name} className="nav-item">
                    <a href={link.href} className="nav-link">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="nav-column">
              <h4 className="nav-title">Support</h4>
              <ul className="nav-list">
                {navigationLinks.support.map((link) => (
                  <li key={link.name} className="nav-item">
                    <a href={link.href} className="nav-link">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div className="nav-column">
              <h4 className="nav-title">Quick Links</h4>
              <ul className="nav-list">
                {navigationLinks.quickLinks.map((link) => (
                  <li key={link.name} className="nav-item">
                    <a href={link.href} className="nav-link">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="footer-newsletter">
            <h4 className="newsletter-title">Stay Updated</h4>
            <p className="newsletter-description">
              Get the latest career tips, AI updates, and exclusive offers
              delivered to your inbox.
            </p>

            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <div className="newsletter-input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="newsletter-input"
                  required
                />
                <button
                  type="submit"
                  className={`newsletter-btn ${
                    isSubscribing ? "subscribing" : ""
                  }`}
                  disabled={isSubscribing}
                >
                  {isSubscribing ? (
                    <>
                      <span className="btn-spinner">⏳</span>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe
                      <span className="btn-arrow">→</span>
                    </>
                  )}
                </button>
              </div>

              {subscribeStatus && (
                <div className={`subscribe-status ${subscribeStatus}`}>
                  {subscribeStatus === "success" ? (
                    <>
                      <span className="status-icon">✅</span>
                      Thank you for subscribing! Check your email for
                      confirmation.
                    </>
                  ) : (
                    <>
                      <span className="status-icon">❌</span>
                      Something went wrong. Please try again later.
                    </>
                  )}
                </div>
              )}
            </form>

            {/* Footer CTA */}
            <div className="footer-cta">
              <h5 className="cta-title">Ready to Get Started?</h5>
              <a href="/signup" className="footer-cta-btn">
                Start Building Your Resume
                <span className="cta-btn-arrow">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">© 2025 ResumeAI. All Rights Reserved.</p>
            <div className="footer-bottom-links">
              <a href="/privacy" className="bottom-link">
                Privacy Policy
              </a>
              <span className="link-separator">•</span>
              <a href="/terms" className="bottom-link">
                Terms of Service
              </a>
              <span className="link-separator">•</span>
              <a href="/cookies" className="bottom-link">
                Cookie Policy
              </a>
            </div>
            <p className="footer-credits">
              Made with <i className="fa-solid fa-heart"></i> for job seekers
              worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
