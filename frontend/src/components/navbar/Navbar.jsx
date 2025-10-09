import React from "react";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="navbar">
      <div className="logo">
        {/* <img src="/logo.png" alt="" /> */}
        <h1 onClick={() => navigate("/")}>ResumeAI</h1>
      </div>
      <ul className="navItems">
        <li onClick={() => navigate("/")}>Home</li>
        <li>About</li>
        <li>Services</li>
        <li>Contact</li>
        <li className="auth-buttons">
          <button className="sign-in-btn" onClick={() => navigate("/signin")}>
            Sign In
          </button>
          <button className="sign-up-btn" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
