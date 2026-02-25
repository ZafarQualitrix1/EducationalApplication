import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MentorLoginPage.css';
import { FaArrowLeft, FaSignInAlt, FaLock, FaEnvelope } from 'react-icons/fa';

function MentorLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/mentor-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Store mentor info in localStorage
      localStorage.setItem('mentor', JSON.stringify(data.mentor));
      localStorage.removeItem('user');
      localStorage.removeItem('admin');

      // Redirect to mentor dashboard
      setTimeout(() => navigate(`/mentor-dashboard/${data.mentor.id}`), 500);
    } catch (err) {
      setError('❌ Connection error. Please check if backend is running.');
      setLoading(false);
    }
  };

  const sampleMentors = [
    'dr.rajesh.kumar@mentor.com',
    'priya.sharma@mentor.com',
    'amit.singh@mentor.com',
    'neha.patel@mentor.com',
    'vikram.reddy@mentor.com'
  ];

  return (
    <div className="mentor-login-container">
      <div className="mentor-login-box">
        <button className="back-btn" onClick={() => navigate('/')}>
          <FaArrowLeft /> Back to Home
        </button>

        <div className="mentor-login-header">
          <FaLock className="mentor-lock-icon" />
          <h2>Mentor Login</h2>
          <p>Access your mentor dashboard</p>
        </div>

        {error && <div className="mentor-error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="mentor-login-form">
          <div className="mentor-form-group">
            <label htmlFor="email">
              <FaEnvelope /> Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="mentor-input"
              required
            />
          </div>

          <div className="mentor-form-group">
            <label htmlFor="password">
              <FaLock /> Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mentor-input"
              required
            />
          </div>

          <button 
            type="submit" 
            className="mentor-login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : <><FaSignInAlt /> Login</> }
          </button>
        </form>

        <div className="mentor-demo-credentials">
          <h4>Sample Mentor Emails:</h4>
          <div className="sample-list">
            {sampleMentors.map((email, index) => (
              <p key={index}>• {email}</p>
            ))}
          </div>
          <p className="password-note"><strong>Password (All):</strong> password123</p>
        </div>
      </div>
    </div>
  );
}

export default MentorLoginPage;
