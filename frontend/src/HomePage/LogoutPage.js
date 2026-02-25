import React from "react";
import { Link } from "react-router-dom";
import "./LogoutPage.css";

const LogoutPage = () => {
  return (
    <div className="logout-page">
      <div className="logout-card">
        <h2>🔓 Logout</h2>
        <p>You have been successfully logged out.</p>
        <Link to="/login" className="login-btn">
          Login Again
        </Link>
      </div>
    </div>
  );
};

export default LogoutPage;
