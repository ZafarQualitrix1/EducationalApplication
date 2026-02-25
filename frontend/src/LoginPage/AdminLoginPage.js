import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLoginPage.css';
import { FaArrowLeft, FaSignInAlt, FaLock, FaUser } from 'react-icons/fa';

function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Store admin info in localStorage
      localStorage.setItem('admin', JSON.stringify(data.admin));
      localStorage.removeItem('user');
      localStorage.removeItem('mentor');

      // Redirect to admin dashboard
      setTimeout(() => navigate('/admin'), 500);
    } catch (err) {
      setError('❌ Connection error. Please check if backend is running.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <button className="back-btn" onClick={() => navigate('/')}>
          <FaArrowLeft /> Back to Home
        </button>

        <div className="admin-login-header">
          <FaLock className="admin-lock-icon" />
          <h2>Admin Login</h2>
          <p>Access admin dashboard</p>
        </div>

        {error && <div className="admin-error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="username">
              <FaUser /> Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              className="admin-input"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">
              <FaLock /> Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="admin-input"
              required
            />
          </div>

          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : <><FaSignInAlt /> Login</> }
          </button>
        </form>

        <div className="admin-demo-credentials">
          <h4>Demo Credentials:</h4>
          <p><strong>Username:</strong> admin</p>
          <p><strong>Password:</strong> admin123</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
