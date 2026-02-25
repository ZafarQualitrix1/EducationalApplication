import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminPage.css';
import { FaSignOutAlt } from 'react-icons/fa';
import BackButton from './BackButton';

const AdminPage = ({ adminId }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    verifiedMentors: 0,
    pendingMentors: 0,
    totalCourses: 0,
    totalRevenue: 0
  });
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      navigate('/admin-login');
      return;
    }
    setAdmin(JSON.parse(adminData));
    loadDashboardData();
  }, [navigate, activeTab]);

  const loadDashboardData = async () => {
    try {
      const statsResponse = await axios.get('http://localhost:5000/api/admin/dashboard-stats');
      setDashboardStats(statsResponse.data);

      if (activeTab === 'students') {
        const studentsResponse = await axios.get('http://localhost:5000/api/admin/students');
        setStudents(studentsResponse.data.students || []);
      } else if (activeTab === 'mentors') {
        const mentorsResponse = await axios.get('http://localhost:5000/api/admin/mentors');
        setMentors(mentorsResponse.data.mentors || []);
      } else if (activeTab === 'attendance') {
        const attendanceResponse = await axios.get('http://localhost:5000/api/admin/attendance');
        setAttendance(attendanceResponse.data.attendance || []);
      } else if (activeTab === 'financial') {
        const financialResponse = await axios.get('http://localhost:5000/api/admin/financial-overview');
        setFinancialData(financialResponse.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setLoading(false);
    }
  };

  const verifyMentor = async (mentorId, status) => {
    try {
      await axios.post('http://localhost:5000/api/admin/verify-mentor', {
        mentorId,
        status
      });
      alert(`✅ Mentor ${status}`);
      loadDashboardData();
    } catch (error) {
      alert('Error: ' + error.response?.data?.error);
    }
  };

  const getRevenueStats = () => {
    if (!financialData) return {};
    const overview = financialData.overview;
    return {
      totalRevenue: overview.totalRevenue || 0,
      adminCommission: overview.totalAdminCommission || 0,
      mentorEarnings: overview.totalMentorEarnings || 0
    };
  };

  // Normalize monthly/transaction data from backend (some APIs return `transactions`)
  const monthlyData = (financialData && (financialData.monthlyData || financialData.transactions)) || [];

  if (loading) {
    return <div className="admin-loader">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="page-back">
        <BackButton label="Back" />
      </div>
      <div className="admin-header">
        <div>
          <h1>🎛️ Admin Control Panel</h1>
          <p className="admin-subtitle">Complete System Management & Analytics</p>
        </div>
        <button 
          className="admin-logout-btn" 
          onClick={() => {
            localStorage.removeItem('admin');
            navigate('/');
          }}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* NAVIGATION TABS */}
      <div className="admin-nav">
        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
          📊 Dashboard
        </button>
        <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
          👥 Students ({dashboardStats.totalStudents})
        </button>
        <button className={activeTab === 'mentors' ? 'active' : ''} onClick={() => setActiveTab('mentors')}>
          👨‍🏫 Mentors ({dashboardStats.verifiedMentors})
        </button>
        <button className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}>
          📋 Attendance
        </button>
        <button className={activeTab === 'financial' ? 'active' : ''} onClick={() => setActiveTab('financial')}>
          💰 Financial
        </button>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="admin-content">
          <div className="stats-grid">
            <div className="stat-card students">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{dashboardStats.totalStudents}</h3>
                <p>Total Students</p>
              </div>
              <div className="stat-trend">↗️ +5%</div>
            </div>

            <div className="stat-card mentors">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{dashboardStats.verifiedMentors}</h3>
                <p>Verified Mentors</p>
              </div>
              <div className="stat-trend">↗️ +2%</div>
            </div>

            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>{dashboardStats.pendingMentors}</h3>
                <p>Pending Mentors</p>
              </div>
              <div className="stat-trend">Needs Review</div>
            </div>

            <div className="stat-card courses">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <h3>{dashboardStats.totalCourses}</h3>
                <p>Active Courses</p>
              </div>
              <div className="stat-trend">↗️ +12%</div>
            </div>

            <div className="stat-card revenue">
              <div className="stat-icon">💵</div>
              <div className="stat-info">
                <h3>₹{(dashboardStats.totalRevenue / 100000).toFixed(1)}L</h3>
                <p>Total Revenue</p>
              </div>
              <div className="stat-trend">↗️ +18%</div>
            </div>

            <div className="stat-card growth">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <h3>{Math.round((dashboardStats.verifiedMentors / (dashboardStats.verifiedMentors + dashboardStats.pendingMentors)) * 100) || 0}%</h3>
                <p>Verification Rate</p>
              </div>
              <div className="stat-trend">Excellent</div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="quick-actions">
            <h2>⚡ Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => setActiveTab('mentors')}>
                <span>👨‍🏫</span>
                Verify Pending Mentors
              </button>
              <button className="action-btn" onClick={() => setActiveTab('students')}>
                <span>🔗</span>
                Assign Mentors to Students
              </button>
              <button className="action-btn" onClick={() => setActiveTab('attendance')}>
                <span>📋</span>
                View Attendance Reports
              </button>
              <button className="action-btn" onClick={() => setActiveTab('financial')}>
                <span>💰</span>
                Generate Financial Reports
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENTS TAB */}
      {activeTab === 'students' && (
        <div className="admin-content">
          <div className="section-header">
            <h2>👥 Student Management ({students.length})</h2>
            <input 
              type="text" 
              placeholder="Search students..."
              className="search-box"
            />
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>City</th>
                  <th>Mentor</th>
                  <th>Study Minutes</th>
                  <th>Rank</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
              </thead>
              <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td className="name-cell">
                        <strong>{student.fullName}</strong>
                      </td>
                    <td>{student.email}</td>
                    <td>{student.mobile}</td>
                    <td>{student.city}</td>
                    <td>{student.mentorName || '—'}</td>
                    <td>
                      <span className="minutes-badge">{student.dailyStudyMinutes}</span>
                    </td>
                    <td>
                      <span className="rank-badge">#{student.ranking}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${student.status}`}>{student.status}</span>
                    </td>
                      <td>
                        <button className="btn-view" onClick={() => navigate(`/student/${student.id}`)}>View Details</button>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MENTORS TAB */}
      {activeTab === 'mentors' && (
        <div className="admin-content">
          <div className="section-header">
            <h2>👨‍🏫 Mentor Management ({mentors.length})</h2>
            <div className="filter-group">
              <button className={filterStatus === 'all' ? 'active' : ''} onClick={() => setFilterStatus('all')}>
                All
              </button>
              <button className={filterStatus === 'verified' ? 'active' : ''} onClick={() => setFilterStatus('verified')}>
                Verified
              </button>
              <button className={filterStatus === 'pending' ? 'active' : ''} onClick={() => setFilterStatus('pending')}>
                Pending
              </button>
            </div>
          </div>

          <div className="mentors-grid">
            {mentors
              .filter(m => filterStatus === 'all' || m.verificationStatus === filterStatus)
              .map(mentor => (
                <div key={mentor.id} className={`mentor-card ${mentor.verificationStatus}`}>
                  <div className="mentor-header">
                    <h3>{mentor.fullName}</h3>
                    <span className={`verify-badge ${mentor.verificationStatus}`}>
                      {mentor.verificationStatus === 'verified' ? '✅' : '⏳'} {mentor.verificationStatus}
                    </span>
                  </div>

                  <div className="mentor-details">
                    <p><strong>Username:</strong> {mentor.username}</p>
                    <p><strong>Email:</strong> {mentor.email}</p>
                    <p><strong>Phone:</strong> {mentor.phone || 'N/A'}</p>
                    <p><strong>Specialization:</strong> {mentor.specialization || 'N/A'}</p>
                    <p><strong>Experience:</strong> {mentor.yearsOfExperience} years</p>
                    <p><strong>Students:</strong> {mentor.totalStudents}</p>
                    <p><strong>Rating:</strong> ⭐ {parseFloat(mentor.averageRating).toFixed(2)}</p>
                  </div>

                  {mentor.verificationStatus === 'pending' && (
                    <div className="mentor-actions">
                      <button 
                        className="btn-verify"
                        onClick={(e) => { e.stopPropagation(); verifyMentor(mentor.id, 'verified'); }}
                      >
                        ✅ Verify
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={(e) => { e.stopPropagation(); verifyMentor(mentor.id, 'rejected'); }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                  <div className="mentor-card-footer">
                    <button className="btn-view" onClick={() => navigate(`/mentor/${mentor.id}`)}>View Details</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="admin-content">
          <div className="section-header">
            <h2>📋 Attendance Report</h2>
            <div className="date-filter">
              <input type="date" className="date-input" />
              <span>to</span>
              <input type="date" className="date-input" />
              <button className="btn-filter">🔍 Filter</button>
            </div>
          </div>

          <div className="attendance-stats">
            <div className="stat">
              <span className="stat-number">{attendance.filter(a => a.status === 'present').length}</span>
              <span className="stat-label">Present</span>
            </div>
            <div className="stat">
              <span className="stat-number">{attendance.filter(a => a.status === 'absent').length}</span>
              <span className="stat-label">Absent</span>
            </div>
            <div className="stat">
              <span className="stat-number">{attendance.filter(a => a.status === 'late').length}</span>
              <span className="stat-label">Late</span>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Mentor</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Study Hours</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 50).map(record => (
                  <tr key={record.id}>
                    <td>{record.studentName}</td>
                    <td>{record.mentorName}</td>
                    <td>{new Date(record.attendanceDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${record.status}`}>{record.status}</span>
                    </td>
                    <td>{record.studyHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FINANCIAL TAB */}
      {activeTab === 'financial' && financialData && (
        <div className="admin-content">
          <div className="section-header">
            <h2>💰 Financial Analytics & Reports</h2>
          </div>

          <div className="financial-overview">
            <div className="financial-card primary">
              <div className="card-icon">💵</div>
              <div className="card-info">
                <p className="label">Total Revenue</p>
                <h3>₹{(getRevenueStats().totalRevenue / 100000).toFixed(2)}L</h3>
              </div>
            </div>

            <div className="financial-card success">
              <div className="card-icon">🏦</div>
              <div className="card-info">
                <p className="label">Admin Commission</p>
                <h3>₹{(getRevenueStats().adminCommission / 100000).toFixed(2)}L</h3>
              </div>
            </div>

            <div className="financial-card info">
              <div className="card-icon">👨‍💼</div>
              <div className="card-info">
                <p className="label">Mentor Earnings</p>
                <h3>₹{(getRevenueStats().mentorEarnings / 100000).toFixed(2)}L</h3>
              </div>
            </div>
          </div>

          <div className="financial-table-section">
            <h3>📊 Monthly Transaction History</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Enrollments</th>
                    <th>Revenue</th>
                    <th>Admin Commission (20%)</th>
                    <th>Mentor Earnings</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map(record => (
                    <tr key={record.id}>
                      <td>{new Date(record.transactionMonth).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</td>
                      <td>{record.totalEnrollments}</td>
                      <td>₹{(record.totalRevenue / 100000).toFixed(2)}L</td>
                      <td>₹{(record.adminCommission / 100000).toFixed(2)}L</td>
                      <td>₹{(record.mentorEarnings / 100000).toFixed(2)}L</td>
                      <td>
                        <span className={`status-badge ${record.status}`}>{record.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
