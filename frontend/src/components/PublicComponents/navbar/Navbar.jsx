import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const token = localStorage.getItem("token");
  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [isMenuOpen]);

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
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    handleNavClick("/signin");
    return;
  };

  return (
    <div className="navbar">
      <div className="logo">
        {/* <img src="/logo.png" alt="" /> */}
        <h1 onClick={() => handleNavClick("/")}>ResumeAI</h1>
      </div>

      {/* Hamburger Menu Button */}
      {isMobile && (
        <button
          className={`hamburger ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}

      {/* Navigation Items */}
      <ul className={`navItems ${isMenuOpen ? "open" : ""}`}>
        <li onClick={() => handleNavClick("/")}>Home</li>
        <li onClick={() => handleNavClick("/about")}>About</li>
        <li onClick={() => handleNavClick("/services")}>Services</li>
        <li onClick={() => handleNavClick("/contact")}>Contact</li>
        <li className="auth-buttons">
          {token ? (
            <>
              <button
                className="sign-in-btn"
                onClick={() => handleNavClick("/dashboard")}
              >
                Dashboard
              </button>
              <button className="sign-up-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="sign-in-btn"
                onClick={() => handleNavClick("/signin")}
              >
                Sign In
              </button>
              <button
                className="sign-up-btn"
                onClick={() => handleNavClick("/signup")}
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
        ></div>
      )}
    </div>
  );
};

export default Navbar;
