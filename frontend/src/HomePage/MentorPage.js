import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './MentorPage.css';
import { FaStar, FaUsers, FaPhone, FaEnvelope, FaArrowLeft, FaAward, FaSignOutAlt } from 'react-icons/fa';

function MentorPage() {
  const navigate = useNavigate();
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loggedInMentor = localStorage.getItem('mentor') ? JSON.parse(localStorage.getItem('mentor')) : null;
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    if (loggedInMentor && mentorId) {
      // Mentor is logged in - show their dashboard
      fetchMentorDashboard(mentorId);
    } else {
      // Show list of all mentors
      fetchMentors();
    }
  }, [loggedInMentor, mentorId]);

  const fetchMentorDashboard = async (mId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/mentor/${mId}/students`);
      const data = await response.json();
      setStudents(data.students || []);
      setMentor(loggedInMentor);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch mentor dashboard data');
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await fetch('http://localhost:5000/mentors');
      const data = await response.json();
      setMentors(data.mentors);
      setLoading(false);

      if (mentorId) {
        const mentor = data.mentors.find(m => m.id === parseInt(mentorId));
        if (mentor) {
          setSelectedMentor(mentor);
        }
      }
    } catch (err) {
      setError('Failed to fetch mentors');
      setLoading(false);
    }
  };

  const getMentorAvatar = (name, index) => {
    const colors = ['#4a90e2', '#f093fb', '#4ade80', '#fbbf24', '#06b6d4', '#ec4899', '#10b981', '#f59e0b'];
    const color = colors[index % colors.length];
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='${color.replace('#', '%23')}'/%3E%3Ctext x='50' y='50' font-size='40' fill='white' text-anchor='middle' dy='.3em' font-weight='bold'%3E${initials}%3C/text%3E%3C/svg%3E`;
  };

  if (loading) {
    return (
      <div className="mentor-page">
        <nav className="mentor-navbar">
          <button className="back-btn" onClick={() => navigate('/')}>
            <FaArrowLeft /> Back
          </button>
          <h1>Loading...</h1>
        </nav>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Mentor Dashboard (when logged in)
  if (loggedInMentor && mentorId) {
    return (
      <div className="mentor-page">
        <nav className="mentor-navbar">
          <div>
            <h1>👨‍🏫 Mentor Dashboard - {loggedInMentor.fullName}</h1>
          </div>
          <button 
            className="logout-btn" 
            onClick={() => {
              localStorage.removeItem('mentor');
              navigate('/');
            }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </nav>

        <div className="mentor-dashboard-container">
          <div className="dashboard-header">
            <h2>👥 Your Students ({students.length})</h2>
          </div>
          
          {students.length > 0 ? (
            <div className="students-table">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>City</th>
                    <th>Daily Study Minutes</th>
                    <th>Ranking</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.fullName}</td>
                      <td>{student.email}</td>
                      <td>{student.city}</td>
                      <td>{student.dailyStudyMinutes || 0}</td>
                      <td>{student.ranking || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-students">
              <p>No students assigned yet</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedMentor) {
    return (
      <div className="mentor-page">
        <nav className="mentor-navbar">
          <button className="back-btn" onClick={() => setSelectedMentor(null)}>
            <FaArrowLeft /> Back to List
          </button>
          <h1>Mentor Profile</h1>
        </nav>

        <div className="mentor-detail-container">
          <div className="mentor-detail-card">
            <div className="mentor-header">
              <img 
                src={getMentorAvatar(selectedMentor.fullName, mentors.indexOf(selectedMentor))} 
                alt={selectedMentor.fullName}
                className="mentor-avatar-large"
              />
              <div className="mentor-info">
                <h1>{selectedMentor.fullName}</h1>
                <p className="specialization">{selectedMentor.specialization}</p>
                <div className="rating-section">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} color={i < Math.floor(selectedMentor.rating) ? '#fbbf24' : '#d1d5db'} />
                    ))}
                  </div>
                  <span className="rating-value">{selectedMentor.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="mentor-details">
              <div className="detail-section">
                <h3>About</h3>
                <p>{selectedMentor.bio}</p>
              </div>

              <div className="stats-grid">
                <div className="stat-item">
                  <FaUsers className="stat-icon" />
                  <div>
                    <div className="stat-number">{selectedMentor.students_count}</div>
                    <div className="stat-label">Students Taught</div>
                  </div>
                </div>
                <div className="stat-item">
                  <FaAward className="stat-icon" />
                  <div>
                    <div className="stat-number">{selectedMentor.experience}+</div>
                    <div className="stat-label">Years Experience</div>
                  </div>
                </div>
              </div>

              <div className="contact-section">
                <h3>Contact Information</h3>
                <div className="contact-item">
                  <FaEnvelope />
                  <a href={`mailto:${selectedMentor.email}`}>{selectedMentor.email}</a>
                </div>
                {selectedMentor.mobile && (
                  <div className="contact-item">
                    <FaPhone />
                    <a href={`tel:${selectedMentor.mobile}`}>{selectedMentor.mobile}</a>
                  </div>
                )}
              </div>

              <div className="action-buttons">
                <button className="btn-primary" onClick={() => alert('Contact feature coming soon!')}>
                  Send Message
                </button>
                <button className="btn-secondary" onClick={() => alert('Enrollment feature coming soon!')}>
                  Enroll in Course
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mentor-page">
      <nav className="mentor-navbar">
        <button className="back-btn" onClick={() => navigate('/')}>
          <FaArrowLeft /> Back
        </button>
        <h1>Our Expert Mentors</h1>
      </nav>

      <div className="mentors-hero">
        <h2>Learn from Industry Experts</h2>
        <p>Our mentors have 8-15+ years of experience in their fields</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="mentors-grid">
        {mentors.map((mentor, index) => (
          <div key={mentor.id} className="mentor-card">
            <div className="mentor-card-image">
              <img 
                src={getMentorAvatar(mentor.fullName, index)} 
                alt={mentor.fullName}
              />
              <div className="mentor-overlay">
                <button 
                  className="view-btn"
                  onClick={() => setSelectedMentor(mentor)}
                >
                  View Profile
                </button>
              </div>
            </div>
            <div className="mentor-card-content">
              <h3>{mentor.fullName}</h3>
              <p className="specialization">{mentor.specialization}</p>
              <div className="mentor-meta">
                <div className="rating">
                  <FaStar color="#fbbf24" /> {mentor.rating.toFixed(1)}
                </div>
                <div className="students">
                  <FaUsers /> {mentor.students_count} Students
                </div>
              </div>
              <div className="experience">
                <FaAward /> {mentor.experience} Years Experience
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MentorPage;
