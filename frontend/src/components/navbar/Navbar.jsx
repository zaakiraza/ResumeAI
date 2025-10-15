import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Check if screen is mobile/tablet size with better breakpoints
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);

      // Close menu when moving to desktop view
      if (width > 768) {
        setIsMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Handle body scroll lock when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [isMenuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false); // Close menu after navigation
  };

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        <div className="logo">
          {/* <img src="/logo.png" alt="" /> */}
          <h1
            onClick={() => handleNavClick("/")}
            tabIndex="0"
            onKeyDown={(e) => e.key === "Enter" && handleNavClick("/")}
          >
            ResumeAI
          </h1>
        </div>

        {/* Hamburger Menu Button */}
        {isMobile && (
          <button
            className={`hamburger ${isMenuOpen ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
            aria-controls="nav-menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}

        {/* Navigation Items */}
        <ul
          className={`navItems ${isMenuOpen ? "open" : ""} ${
            isTablet ? "tablet" : ""
          }`}
          id="nav-menu"
          role="menubar"
        >
          <li role="none">
            <button
              role="menuitem"
              className="nav-link"
              onClick={() => handleNavClick("/")}
              tabIndex={isMobile && !isMenuOpen ? -1 : 0}
            >
              Home
            </button>
          </li>
          <li role="none">
            <button
              role="menuitem"
              className="nav-link"
              onClick={() => handleNavClick("/about")}
              tabIndex={isMobile && !isMenuOpen ? -1 : 0}
            >
              About
            </button>
          </li>
          <li role="none">
            <button
              role="menuitem"
              className="nav-link"
              onClick={() => handleNavClick("/services")}
              tabIndex={isMobile && !isMenuOpen ? -1 : 0}
            >
              Services
            </button>
          </li>
          <li role="none">
            <button
              role="menuitem"
              className="nav-link"
              onClick={() => handleNavClick("/contact")}
              tabIndex={isMobile && !isMenuOpen ? -1 : 0}
            >
              Contact
            </button>
          </li>
          <li className="auth-buttons" role="none">
            {token ? (
              <>
                <button
                  className="sign-in-btn"
                  onClick={() => handleNavClick("/dashboard")}
                  tabIndex={isMobile && !isMenuOpen ? -1 : 0}
                  role="menuitem"
                >
                  Dashboard
                </button>
                <button
                  className="sign-up-btn"
                  onClick={() => handleLogout()}
                  tabIndex={isMobile && !isMenuOpen ? -1 : 0}
                  role="menuitem"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="sign-in-btn"
                  onClick={() => handleNavClick("/signin")}
                  tabIndex={isMobile && !isMenuOpen ? -1 : 0}
                  role="menuitem"
                >
                  Sign In
                </button>
                <button
                  className="sign-up-btn"
                  onClick={() => handleNavClick("/signup")}
                  tabIndex={isMobile && !isMenuOpen ? -1 : 0}
                  role="menuitem"
                >
                  Sign Up
                </button>
              </>
            )}
          </li>
        </ul>

        {/* Overlay for mobile menu */}
        {isMenuOpen && (
          <div
            className="menu-overlay"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          ></div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
