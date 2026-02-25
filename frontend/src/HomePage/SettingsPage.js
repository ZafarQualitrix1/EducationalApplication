import React, { useState } from "react";
import { FaUserCircle, FaMoon, FaSun } from "react-icons/fa";
import "./SettingsPage.css";
import BackButton from '../components/BackButton';

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("English");
  const [email, setEmail] = useState("johndoe@gmail.com");
  const [password, setPassword] = useState("");

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={`settings-page ${darkMode ? "dark" : "light"}`}>
      <div className="settings-card">
        <div className="page-back">
          <BackButton label="Back" />
        </div>
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button className="dark-btn" onClick={toggleDarkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <div className="settings-section">
          <h3>Account Settings</h3>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        <div className="settings-section">
          <h3>Preferences</h3>
          <label>
            Notifications:
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
          </label>
          <label>
            Language:
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
            </select>
          </label>
        </div>

        <div className="settings-section">
          <h3>Other Features</h3>
          <ul>
            <li>💡 Enable AI personalized recommendations</li>
            <li>🎓 Manage Certificates</li>
            <li>📚 Clear Course History</li>
            <li>🔒 Privacy Settings</li>
          </ul>
        </div>

        <button className="save-btn">💾 Save Settings</button>
      </div>
    </div>
  );
};

export default SettingsPage;
