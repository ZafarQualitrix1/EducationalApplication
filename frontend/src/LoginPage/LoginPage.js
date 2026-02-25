// src/LoginPage/LoginPage.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ useNavigate for redirect
import {
  FaFacebookF,
  FaGoogle,
  FaWhatsapp,
  FaInstagram,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous errors
    setEmailError("");
    setPasswordError("");
    setGeneralError("");
    setSuccessMessage("");

    let hasError = false;

    if (!email) {
      setEmailError("Email cannot be empty.");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Password cannot be empty.");
      hasError = true;
    }

    if (hasError) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.error) {
        setGeneralError(`❌ ${data.error}`);
        setSuccessMessage("");
      } else {
        setSuccessMessage("✅ Login Successful!");
        setEmail("");
        setPassword("");
        setGeneralError("");

        // Store user info in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect to Dashboard after successful login
        setTimeout(() => navigate(`/dashboard/${data.user.id}`), 1000);
      }
    } catch (err) {
      setGeneralError("❌ Server error. Please try again later.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Welcome Back 👋</h2>

        {generalError && <p className="error-text general-error">{generalError}</p>}
        {successMessage && <p className="success-text">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={emailError ? "input-error" : ""}
            />
            {emailError && <p className="input-error-message">{emailError}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={passwordError ? "input-error" : ""}
            />
            {passwordError && <p className="input-error-message">{passwordError}</p>}
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="signup-text">
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </p>

        <div className="social-login">
          <p>Or login with</p>
          <div className="social-icons">
            <a href="https://www.facebook.com/login" target="_blank" rel="noopener noreferrer" className="social-icon facebook"><FaFacebookF /></a>
            <a href="https://accounts.google.com/signin" target="_blank" rel="noopener noreferrer" className="social-icon google"><FaGoogle /></a>
            <a href="https://github.com/login" target="_blank" rel="noopener noreferrer" className="social-icon github"><FaGithub /></a>
            <a href="https://linkedin.com/login" target="_blank" rel="noopener noreferrer" className="social-icon linkedin"><FaLinkedin /></a>
            <a href="https://web.whatsapp.com/" target="_blank" rel="noopener noreferrer" className="social-icon whatsapp"><FaWhatsapp /></a>
            <a href="https://www.instagram.com/accounts/login/" target="_blank" rel="noopener noreferrer" className="social-icon instagram"><FaInstagram /></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
