import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';
import { FaSignOutAlt, FaUsers, FaChalkboardUser, FaBook, FaBarChart, FaEye } from 'react-icons/fa';

function AdminPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('admin');
    if (savedAdmin) {
      const adminData = JSON.parse(savedAdmin);
      setAdmin(adminData);
      setIsLoggedIn(true);
      fetchDashboardData();
    }
  }, []);

  const handleLogin = async (e) => {
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

      setAdmin(data.admin);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      setIsLoggedIn(true);
      setUsername('');
      setPassword('');
      fetchDashboardData();
    } catch (err) {
      setError('Connection error. Make sure the server is running.');
    }
    setLoading(false);
  };

  const fetchDashboardData = async () => {
    try {
      const [dashResponse, studentsResponse, mentorsResponse] = await Promise.all([
        fetch('http://localhost:5000/admin/dashboard'),
        fetch('http://localhost:5000/admin/students'),
        fetch('http://localhost:5000/admin/mentors')
      ]);

      const [dashData, studentsData, mentorsData] = await Promise.all([
        dashResponse.json(),
        studentsResponse.json(),
        mentorsResponse.json()
      ]);

      setDashboardData(dashData.dashboard);
      setStudents(studentsData.students);
      setMentors(mentorsData.mentors);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const fetchStudentProfile = async (studentId) => {
    try {
      const response = await fetch(`http://localhost:5000/admin/student/${studentId}`);
      const data = await response.json();
      setSelectedStudent(data.student);
    } catch (err) {
      console.error('Error fetching student:', err);
    }
  };

  const fetchMentorProfile = async (mentorId) => {
    try {
      const response = await fetch(`http://localhost:5000/admin/mentor/${mentorId}`);
      const data = await response.json();
      setSelectedMentor(data.mentor);
    } catch (err) {
      console.error('Error fetching mentor:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    setAdmin(null);
    setIsLoggedIn(false);
    setActiveTab('dashboard');
    setSelectedStudent(null);
    setSelectedMentor(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login-page">
        <div className="login-container">
          <div className="login-box">
            <h1>Admin Panel</h1>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" disabled={loading} className="login-btn">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <div className="demo-credentials">
              <p>Demo Credentials:</p>
              <small>Username: admin</small>
              <small>Password: admin123</small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <h1>CODE WARRIOR Admin Panel</h1>
          <p>Welcome, {admin.username}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-nav">
        <button
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <FaBarChart /> Dashboard
        </button>
        <button
          className={`nav-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <FaUsers /> Students ({students.length})
        </button>
        <button
          className={`nav-btn ${activeTab === 'mentors' ? 'active' : ''}`}
          onClick={() => setActiveTab('mentors')}
        >
          <FaChalkboardUser /> Mentors ({mentors.length})
        </button>
      </nav>

      {/* Main Content */}
      <div className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            <h2>System Overview</h2>
            {dashboardData ? (
              <div className="stats-container">
                <div className="stat-card">
                  <FaUsers className="stat-icon" />
                  <div className="stat-info">
                    <div className="stat-number">{dashboardData.totalStudents}</div>
                    <div className="stat-label">Total Students</div>
                  </div>
                </div>
                <div className="stat-card">
                  <FaChalkboardUser className="stat-icon" />
                  <div className="stat-info">
                    <div className="stat-number">{dashboardData.totalMentors}</div>
                    <div className="stat-label">Total Mentors</div>
                  </div>
                </div>
                <div className="stat-card">
                  <FaBook className="stat-icon" />
                  <div className="stat-info">
                    <div className="stat-number">{dashboardData.totalCourses}</div>
                    <div className="stat-label">Total Courses</div>
                  </div>
                </div>
                <div className="stat-card">
                  <FaBarChart className="stat-icon" />
                  <div className="stat-info">
                    <div className="stat-number">{dashboardData.totalEnrollments}</div>
                    <div className="stat-label">Total Enrollments</div>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading dashboard data...</p>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && !selectedStudent && (
          <div className="students-section">
            <h2>All Students</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PRN</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>City</th>
                    <th>Study Minutes</th>
                    <th>Ranking</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.prn}</td>
                      <td>{student.fullName}</td>
                      <td>{student.email}</td>
                      <td>{student.city}</td>
                      <td>{student.dailyStudyMinutes}</td>
                      <td>{student.ranking}</td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => fetchStudentProfile(student.id)}
                        >
                          <FaEye /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Student Detail View */}
        {selectedStudent && (
          <div className="detail-view">
            <button className="back-btn" onClick={() => setSelectedStudent(null)}>
              ← Back to Students
            </button>
            <div className="profile-card">
              <h2>{selectedStudent.fullName}</h2>
              <div className="profile-details">
                <div className="detail-row">
                  <span className="label">PRN:</span>
                  <span>{selectedStudent.prn}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span>{selectedStudent.email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Mobile:</span>
                  <span>{selectedStudent.mobile}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Date of Birth:</span>
                  <span>{new Date(selectedStudent.dob).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Gender:</span>
                  <span>{selectedStudent.gender}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Address:</span>
                  <span>{selectedStudent.address}</span>
                </div>
                <div className="detail-row">
                  <span className="label">City:</span>
                  <span>{selectedStudent.city}</span>
                </div>
                <div className="detail-row">
                  <span className="label">State:</span>
                  <span>{selectedStudent.state}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Pin Code:</span>
                  <span>{selectedStudent.pinCode}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Daily Study Minutes:</span>
                  <span>{selectedStudent.dailyStudyMinutes}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Ranking:</span>
                  <span>{selectedStudent.ranking}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mentors Tab */}
        {activeTab === 'mentors' && !selectedMentor && (
          <div className="mentors-section">
            <h2>All Mentors</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Rating</th>
                    <th>Students</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mentors.map((mentor) => (
                    <tr key={mentor.id}>
                      <td>{mentor.fullName}</td>
                      <td>{mentor.email}</td>
                      <td>{mentor.specialization}</td>
                      <td>{mentor.experience}+</td>
                      <td>{mentor.rating.toFixed(1)}</td>
                      <td>{mentor.students_count}</td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => fetchMentorProfile(mentor.id)}
                        >
                          <FaEye /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mentor Detail View */}
        {selectedMentor && (
          <div className="detail-view">
            <button className="back-btn" onClick={() => setSelectedMentor(null)}>
              ← Back to Mentors
            </button>
            <div className="profile-card">
              <h2>{selectedMentor.fullName}</h2>
              <div className="profile-details">
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span>{selectedMentor.email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Specialization:</span>
                  <span>{selectedMentor.specialization}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Bio:</span>
                  <span>{selectedMentor.bio}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Mobile:</span>
                  <span>{selectedMentor.mobile}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Experience:</span>
                  <span>{selectedMentor.experience}+ years</span>
                </div>
                <div className="detail-row">
                  <span className="label">Rating:</span>
                  <span>{selectedMentor.rating.toFixed(2)} ⭐</span>
                </div>
                <div className="detail-row">
                  <span className="label">Students Taught:</span>
                  <span>{selectedMentor.students_count}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
