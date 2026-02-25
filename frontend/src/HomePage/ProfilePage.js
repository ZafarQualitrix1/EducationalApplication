import React, { useState } from "react";
import { FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";
import "./ProfilePage.css";
import BackButton from '../components/BackButton';

const ProfilePage = () => {
  const [editMode, setEditMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [avatar, setAvatar] = useState("https://i.pravatar.cc/150?img=12");
  const [user, setUser] = useState({
    name: "John Doe",
    email: "johndoe@gmail.com",
    bio: "Lifelong learner | Web Developer | Tech Enthusiast",
    joined: "March 2024",
    courses: [
      { title: "React for Beginners", progress: 60 },
      { title: "Advanced JavaScript", progress: 100 },
      { title: "AI & Machine Learning Basics", progress: 0 },
    ],
    social: {
      linkedin: "https://linkedin.com/",
      github: "https://github.com/",
      twitter: "https://twitter.com/",
    },
    badges: ["🏆 Top Learner", "💡 Innovator", "🎯 Goal Achiever"],
    latestFeatures: [
      "🎓 Certificate Tracker",
      "📊 Progress Dashboard",
      "🔔 Notifications & Updates"
    ]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const addCourse = () => {
    const newTitle = prompt("Enter new course title:");
    if (newTitle) {
      setUser({
        ...user,
        courses: [...user.courses, { title: newTitle, progress: 0 }],
      });
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={`profile-page ${darkMode ? "dark" : "light"}`}>
      <div className="page-back">
        <BackButton label="Back" />
      </div>
      <div className="profile-card">
        {/* Header */}
        <div className="profile-header">
          <div className="avatar-wrapper">
            <img src={avatar} alt="Profile" className="profile-avatar" />
            {editMode && (
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="avatar-input"
              />
            )}
          </div>

          <div className="profile-info">
            {editMode ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  className="edit-input"
                />
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  className="edit-input"
                />
              </>
            ) : (
              <>
                <h2>{user.name}</h2>
                <p>{user.email}</p>
              </>
            )}
          </div>

          <div className="profile-buttons">
            <button className="edit-btn" onClick={() => setEditMode(!editMode)}>
              {editMode ? "💾 Save" : "✏️ Edit"}
            </button>
            <button className="dark-btn" onClick={toggleDarkMode}>
              {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </div>

        {/* About */}
        <div className="profile-body">
          <h3>About Me</h3>
          {editMode ? (
            <textarea
              name="bio"
              value={user.bio}
              onChange={handleChange}
              className="edit-textarea"
            />
          ) : (
            <p>{user.bio}</p>
          )}
          <p className="joined">👤 Joined: {user.joined}</p>
        </div>

        {/* Courses */}
        <div className="profile-courses">
          <h3>My Courses</h3>
          <button className="add-course-btn" onClick={addCourse}>
            ➕ Add Course
          </button>
          <ul>
            {user.courses.map((course, idx) => (
              <li key={idx}>
                <div className="course-title">
                  {course.title}
                  <span className="status">
                    [{course.progress === 100
                      ? "Completed"
                      : course.progress === 0
                      ? "Locked"
                      : "In Progress"}]
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Badges */}
        <div className="profile-badges">
          <h3>Achievements & Badges</h3>
          <div className="badges">
            {user.badges.map((badge, idx) => (
              <span key={idx} className="badge">{badge}</span>
            ))}
          </div>
        </div>

        {/* Latest Features */}
        <div className="profile-latest-features">
          <h3>Latest Features</h3>
          <ul>
            {user.latestFeatures.map((feat, idx) => (
              <li key={idx}>{feat}</li>
            ))}
          </ul>
        </div>

        {/* Social Links with Icons */}
        <div className="profile-social">
          <h3>Connect with Me</h3>
          <div className="social-links horizontal">
            <a
              href={user.social.linkedin}
              target="_blank"
              rel="noreferrer"
              className={`social-icon ${darkMode ? "dark" : "light"}`}
            >
              <FaLinkedin />
            </a>
            <a
              href={user.social.github}
              target="_blank"
              rel="noreferrer"
              className={`social-icon ${darkMode ? "dark" : "light"}`}
            >
              <FaGithub />
            </a>
            <a
              href={user.social.twitter}
              target="_blank"
              rel="noreferrer"
              className={`social-icon ${darkMode ? "dark" : "light"}`}
            >
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
