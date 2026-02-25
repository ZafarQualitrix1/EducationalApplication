import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './StudentPage.css';
import BackButton from './BackButton';

const StudentPage = ({ studentId }) => {
  const params = useParams();
  const storedStudent = (() => {
    try {
      return JSON.parse(localStorage.getItem('student') || '{}');
    } catch (e) {
      return {};
    }
  })();
  const idToUse = studentId || params.studentId || storedStudent.id;
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [studyMinutes, setStudyMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrollmentCourse, setEnrollmentCourse] = useState(null);

  useEffect(() => {
    loadDashboardData();
    loadCourses();
  }, [idToUse]);

  const loadCourses = async () => {
    // Dummy courses data with videos and pricing
    const dummyCourses = [
      {
        id: 1,
        name: 'Web Development',
        icon: '🌐',
        price: 4999,
        instructor: 'Rahul Kumar',
        duration: '8 weeks',
        level: 'Beginner',
        students: 234,
        rating: 4.8,
        summary: 'Learn HTML, CSS, and JavaScript from scratch. Build responsive websites and web applications.',
        videoUrl: 'https://via.placeholder.com/400x225?text=Web+Development',
        modules: 12,
        enrolled: false
      },
      {
        id: 2,
        name: 'React Advanced',
        icon: '⚛️',
        price: 5999,
        instructor: 'Priya Singh',
        duration: '10 weeks',
        level: 'Intermediate',
        students: 156,
        rating: 4.9,
        summary: 'Master React hooks, context API, and build complex single-page applications.',
        videoUrl: 'https://via.placeholder.com/400x225?text=React+Advanced',
        modules: 15,
        enrolled: false
      },
      {
        id: 3,
        name: 'Python for Data Science',
        icon: '🐍',
        price: 6999,
        instructor: 'Amit Patel',
        duration: '12 weeks',
        level: 'Intermediate',
        students: 312,
        rating: 4.7,
        summary: 'Learn pandas, numpy, matplotlib, and scikit-learn for data analysis and visualization.',
        videoUrl: 'https://via.placeholder.com/400x225?text=Data+Science',
        modules: 20,
        enrolled: false
      },
      {
        id: 4,
        name: 'JavaScript Mastery',
        icon: '📝',
        price: 3999,
        instructor: 'Neha Sharma',
        duration: '6 weeks',
        level: 'Beginner',
        students: 428,
        rating: 4.6,
        summary: 'Complete guide to JavaScript ES6+. Learn async/await, promises, and modern patterns.',
        videoUrl: 'https://via.placeholder.com/400x225?text=JavaScript',
        modules: 18,
        enrolled: true
      },
      {
        id: 5,
        name: 'Full Stack Development',
        icon: '💻',
        price: 9999,
        instructor: 'Rohit Singh',
        duration: '16 weeks',
        level: 'Advanced',
        students: 87,
        rating: 4.9,
        summary: 'Complete full-stack bootcamp with MERN stack. Build and deploy production apps.',
        videoUrl: 'https://via.placeholder.com/400x225?text=Full+Stack',
        modules: 32,
        enrolled: false
      }
    ];
    setCourses(dummyCourses);
  };

  const loadDashboardData = async () => {
    try {
      if (!idToUse) {
        setLoading(false);
        return;
      }
      const response = await axios.get(`http://localhost:5000/api/student/${idToUse}/dashboard`);
      setDashboardData(response.data);
      setStudyMinutes(response.data.student.dailyStudyMinutes || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error loading student dashboard:', error);
      setLoading(false);
    }
  };

  const recordStudyTime = async () => {
    try {
      await axios.post('http://localhost:5000/api/update-study', {
        userId: idToUse,
        minutes: parseInt(studyMinutes)
      });
      alert('✅ Study time updated successfully!');
      loadDashboardData();
    } catch (error) {
      alert('Error: ' + error.response?.data?.error);
    }
  };

  if (loading) {
    return <div className="student-loader">Loading your dashboard...</div>;
  }

  if (!dashboardData || !dashboardData.student) {
    return <div className="student-loader">Student data not available.</div>;
  }

  const student = dashboardData?.student || {};
  const attendanceList = dashboardData?.attendance || [];
  const performanceList = dashboardData?.performance || [];
  const attendanceStats = {
    present: attendanceList.filter(a => a.status === 'present').length || 0,
    absent: attendanceList.filter(a => a.status === 'absent').length || 0,
    late: attendanceList.filter(a => a.status === 'late').length || 0
  };

  const performanceAverage = performanceList.length > 0
    ? (performanceList.reduce((sum, p) => sum + parseFloat(p.overallScore || 0), 0) / performanceList.length).toFixed(2)
    : 0;

  return (
    <div className="student-dashboard">
      <div className="page-back">
        <BackButton label="Back" />
      </div>
      <div className="student-header">
        <div className="header-content">
          <h1>🎓 Your Learning Dashboard</h1>
          <p className="student-name">Welcome, {student.fullName}!</p>
        </div>
        <div className="header-stats">
          <div className="header-stat">
            <span className="stat-value">{student.ranking}</span>
            <span className="stat-label">Your Rank</span>
          </div>
          <div className="header-stat">
            <span className="stat-value">{student.dailyStudyMinutes}</span>
            <span className="stat-label">Study Minutes</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="student-nav">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
          📊 Overview
        </button>
        <button className={activeTab === 'courses' ? 'active' : ''} onClick={() => setActiveTab('courses')}>
          📚 Courses
        </button>
        <button className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}>
          📋 Attendance
        </button>
        <button className={activeTab === 'performance' ? 'active' : ''} onClick={() => setActiveTab('performance')}>
          📈 Performance
        </button>
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
          👤 Profile
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="student-content">
          <div className="overview-container">
            <div className="left-section">
              <div className="overview-grid">
                <div className="card-container">
                  <div className="info-card achievement">
                    <h2>🏆 Your Achievements</h2>
                    <div className="achievement-list">
                      <div className="achievement-item">
                        <span className="achievement-icon">🌟</span>
                        <span className="achievement-text">5 Day Streak</span>
                      </div>
                      <div className="achievement-item">
                        <span className="achievement-icon">📚</span>
                        <span className="achievement-text">{performanceList.length} Assessments Completed</span>
                      </div>
                      <div className="achievement-item">
                        <span className="achievement-icon">💪</span>
                        <span className="achievement-text">Consistent Performer</span>
                      </div>
                      <div className="achievement-item">
                        <span className="achievement-icon">🎯</span>
                        <span className="achievement-text">Goal Focused</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-card quick-stats">
                    <h2>📊 Quick Stats</h2>
                    <div className="quick-stats-grid">
                      <div className="quick-stat">
                        <span className="count">{attendanceStats.present}</span>
                        <span className="label">Days Present</span>
                      </div>
                      <div className="quick-stat">
                        <span className="count">{attendanceStats.absent}</span>
                        <span className="label">Days Absent</span>
                      </div>
                      <div className="quick-stat">
                        <span className="count">{attendanceStats.late}</span>
                        <span className="label">Days Late</span>
                      </div>
                      <div className="quick-stat">
                        <span className="count">{performanceAverage}</span>
                        <span className="label">Avg Score</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-card study-tracker">
                    <h2>⏱️ Log Study Time</h2>
                    <div className="study-form">
                      <input
                        type="number"
                        min="0"
                        max="480"
                        value={studyMinutes}
                        onChange={(e) => setStudyMinutes(e.target.value)}
                        placeholder="Enter study minutes"
                        className="study-input"
                      />
                      <button className="btn-submit" onClick={recordStudyTime}>
                        📝 Log Time
                      </button>
                    </div>
                    <p className="study-hint">Your daily study goal: 120 minutes</p>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(((student.dailyStudyMinutes || 0) / 120) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="card-container">
                  <div className="info-card upcoming">
                    <h2>📅 Upcoming</h2>
                    <div className="upcoming-list">
                      <div className="upcoming-item">
                        <span className="time">Today</span>
                        <span className="event">Mentor Session - 4:00 PM</span>
                      </div>
                      <div className="upcoming-item">
                        <span className="time">Tomorrow</span>
                        <span className="event">Assignment Deadline</span>
                      </div>
                      <div className="upcoming-item">
                        <span className="time">Friday</span>
                        <span className="event">Performance Review</span>
                      </div>
                      <div className="upcoming-item">
                        <span className="time">Next Week</span>
                        <span className="event">Course Completion</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-card mentor-info">
                    <h2>👨‍🏫 Your Mentor</h2>
                    <div className="mentor-card-student">
                      <div className="mentor-name">{student.mentorName || 'Not Assigned'}</div>
                      <div className="mentor-details-list">
                        <p>📧 mentor@system.com</p>
                        <p>📱 +91-9876543210</p>
                        <p>⭐ Rating: 4.8/5</p>
                        <p>📚 Students: 25</p>
                      </div>
                      <button className="btn-contact">💬 Contact Mentor</button>
                    </div>
                  </div>

                  <div className="info-card performance-card">
                    <h2>📈 Performance Trend</h2>
                    <div className="performance-chart">
                      <div className="chart-bar" style={{ height: performanceAverage + '%' }}>
                        <span className="bar-label">{performanceAverage}%</span>
                      </div>
                      <div className="chart-label">Overall Average</div>
                    </div>
                    <p className="performance-comment">
                      {performanceAverage >= 80 ? '🌟 Excellent performance!' : performanceAverage >= 70 ? '👍 Good work, keep it up!' : '💪 Keep practicing!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="right-section">
              <div className="charts-container">
                <div className="chart-card">
                  <h3>📊 Attendance Chart</h3>
                  <div className="bar-chart">
                    <div className="bar-item">
                      <div className="bar" style={{ height: `${(attendanceStats.present / (attendanceStats.present + attendanceStats.absent + attendanceStats.late)) * 100 || 0}%`, backgroundColor: '#4caf50' }}></div>
                      <span className="bar-name">Present</span>
                    </div>
                    <div className="bar-item">
                      <div className="bar" style={{ height: `${(attendanceStats.absent / (attendanceStats.present + attendanceStats.absent + attendanceStats.late)) * 100 || 0}%`, backgroundColor: '#f44336' }}></div>
                      <span className="bar-name">Absent</span>
                    </div>
                    <div className="bar-item">
                      <div className="bar" style={{ height: `${(attendanceStats.late / (attendanceStats.present + attendanceStats.absent + attendanceStats.late)) * 100 || 0}%`, backgroundColor: '#ff9800' }}></div>
                      <span className="bar-name">Late</span>
                    </div>
                  </div>
                </div>

                <div className="chart-card">
                  <h3>📈 Performance Distribution</h3>
                  <div className="pie-chart">
                    <div className="pie-segments">
                      <div className="segment excellent" style={{ '--percentage': '45' }}></div>
                      <div className="segment good" style={{ '--percentage': '35' }}></div>
                      <div className="segment average" style={{ '--percentage': '15' }}></div>
                      <div className="segment poor" style={{ '--percentage': '5' }}></div>
                    </div>
                    <div className="pie-legend">
                      <div className="legend-item"><span className="legend-color excellent"></span> Excellent (80+)</div>
                      <div className="legend-item"><span className="legend-color good"></span> Good (70-79)</div>
                      <div className="legend-item"><span className="legend-color average"></span> Average (60-69)</div>
                      <div className="legend-item"><span className="legend-color poor"></span> Poor (&lt;60)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COURSES TAB */}
      {activeTab === 'courses' && (
        <div className="student-content">
          <div className="courses-section">
            <div className="courses-header">
              <h2>📚 Available Courses</h2>
              <p className="courses-subtitle">Explore and enroll in new courses to expand your skills</p>
            </div>

            <div className="courses-grid">
              {courses.map(course => (
                <div key={course.id} className={`course-card ${course.enrolled ? 'enrolled' : ''}`}>
                  <div className="course-video-container">
                    <img src={course.videoUrl} alt={course.name} className="course-video" />
                    <div className="course-icon-badge">{course.icon}</div>
                    {course.enrolled && <div className="enrolled-badge">✓ Enrolled</div>}
                  </div>

                  <div className="course-content">
                    <h3 className="course-name">{course.name}</h3>
                    <p className="course-summary">{course.summary}</p>

                    <div className="course-meta">
                      <div className="meta-item">
                        <span className="meta-icon">👨‍🏫</span>
                        <span className="meta-text">{course.instructor}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">⭐</span>
                        <span className="meta-text">{course.rating}/5 ({course.students}+)</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">⏱️</span>
                        <span className="meta-text">{course.duration}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">📦</span>
                        <span className="meta-text">{course.modules} modules</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">🎓</span>
                        <span className="meta-text">{course.level}</span>
                      </div>
                    </div>

                    <div className="course-footer">
                      <div className="course-price">
                        <span className="price-label">₹</span>
                        <span className="price-value">{course.price}</span>
                      </div>
                      {!course.enrolled ? (
                        <button
                          className="btn-enroll"
                          onClick={() => {
                            setEnrollmentCourse(course);
                            setShowEnrollmentModal(true);
                          }}
                        >
                          🛒 Enroll Now
                        </button>
                      ) : (
                        <button className="btn-view-course">👉 View Course</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ENROLLMENT MODAL */}
      {showEnrollmentModal && enrollmentCourse && (
        <div className="modal-overlay" onClick={() => setShowEnrollmentModal(false)}>
          <div className="enrollment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✅ Confirm Enrollment</h2>
              <button className="modal-close" onClick={() => setShowEnrollmentModal(false)}>✕</button>
            </div>

            <div className="enrollment-content">
              <div className="enrollment-course-info">
                <img src={enrollmentCourse.videoUrl} alt={enrollmentCourse.name} className="modal-course-image" />
                <div className="enrollment-details">
                  <h3>{enrollmentCourse.name}</h3>
                  <p className="instructor">By {enrollmentCourse.instructor}</p>
                  <p className="summary">{enrollmentCourse.summary}</p>
                  <div className="course-benefits">
                    <h4>📚 What You'll Learn:</h4>
                    <ul>
                      <li>✓ Complete course curriculum</li>
                      <li>✓ {enrollmentCourse.modules} modules & assignments</li>
                      <li>✓ Lifetime access to course materials</li>
                      <li>✓ Certificate upon completion</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="enrollment-payment">
                <h3>💳 Payment Details</h3>
                <div className="payment-info">
                  <div className="payment-row">
                    <span className="payment-label">Course Price:</span>
                    <span className="payment-value">₹{enrollmentCourse.price}</span>
                  </div>
                  <div className="payment-row discount">
                    <span className="payment-label">Early Bird Discount (10%):</span>
                    <span className="payment-value discount-value">-₹{Math.floor(enrollmentCourse.price * 0.1)}</span>
                  </div>
                  <div className="payment-row">
                    <span className="payment-label">GST (18%):</span>
                    <span className="payment-value">₹{Math.floor((enrollmentCourse.price - Math.floor(enrollmentCourse.price * 0.1)) * 0.18)}</span>
                  </div>
                  <div className="payment-row total">
                    <span className="payment-label">Total Amount:</span>
                    <span className="payment-value total-amount">₹{Math.floor((enrollmentCourse.price - Math.floor(enrollmentCourse.price * 0.1)) * 1.18)}</span>
                  </div>
                </div>

                <div className="payment-methods">
                  <h4>🏦 Select Payment Method:</h4>
                  <div className="payment-options">
                    <label className="payment-option">
                      <input type="radio" name="payment" value="card" defaultChecked />
                      <span>💳 Credit/Debit Card</span>
                    </label>
                    <label className="payment-option">
                      <input type="radio" name="payment" value="upi" />
                      <span>📱 UPI</span>
                    </label>
                    <label className="payment-option">
                      <input type="radio" name="payment" value="wallet" />
                      <span>💰 Digital Wallet</span>
                    </label>
                    <label className="payment-option">
                      <input type="radio" name="payment" value="emi" />
                      <span>📊 EMI (0% interest)</span>
                    </label>
                  </div>
                </div>

                <div className="payment-policies">
                  <label className="checkbox">
                    <input type="checkbox" defaultChecked />
                    <span>I agree to the Terms & Conditions</span>
                  </label>
                  <label className="checkbox">
                    <input type="checkbox" defaultChecked />
                    <span>I have read the refund policy (30-day money back guarantee)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEnrollmentModal(false)}>Cancel</button>
              <button className="btn-pay">💳 Proceed to Payment (₹{Math.floor((enrollmentCourse.price - Math.floor(enrollmentCourse.price * 0.1)) * 1.18)})</button>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="student-content">
          <div className="attendance-summary">
            <h2>📋 Attendance Summary</h2>
            
            <div className="attendance-cards">
              <div className="attendance-stat-card present">
                <div className="stat-circle">
                  <span className="circle-icon">✓</span>
                  <span className="circle-text">Present</span>
                </div>
                <span className="stat-number">{attendanceStats.present}</span>
                <span className="stat-percent">
                  {dashboardData.attendance.length > 0 
                    ? ((attendanceStats.present / dashboardData.attendance.length) * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>

              <div className="attendance-stat-card absent">
                <div className="stat-circle">
                  <span className="circle-icon">✗</span>
                  <span className="circle-text">Absent</span>
                </div>
                <span className="stat-number">{attendanceStats.absent}</span>
                <span className="stat-percent">
                  {dashboardData.attendance.length > 0 
                    ? ((attendanceStats.absent / dashboardData.attendance.length) * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>

              <div className="attendance-stat-card late">
                <div className="stat-circle">
                  <span className="circle-icon">⏱️</span>
                  <span className="circle-text">Late</span>
                </div>
                <span className="stat-number">{attendanceStats.late}</span>
                <span className="stat-percent">
                  {dashboardData.attendance.length > 0 
                    ? ((attendanceStats.late / dashboardData.attendance.length) * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>
            </div>

            <div className="attendance-table">
              <h3>Recent Records</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Study Hours</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList.slice(0, 15).map(record => (
                    <tr key={record.id}>
                      <td>{record.attendanceDate ? new Date(record.attendanceDate).toLocaleDateString() : 'N/A'}</td>
                      <td><span className={`badge ${record.status}`}>{record.status}</span></td>
                      <td>{record.studyHours ?? 0}h</td>
                      <td>{record.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PERFORMANCE TAB */}
      {activeTab === 'performance' && (
        <div className="student-content">
          <div className="performance-section">
            <h2>📈 Performance Analysis</h2>

            <div className="performance-overview">
              <div className="perf-stat">
                <span className="perf-label">Average Score</span>
                <span className="perf-value">{performanceAverage}</span>
              </div>
              <div className="perf-stat">
                <span className="perf-label">Assessments</span>
                <span className="perf-value">{performanceList.length}</span>
              </div>
              <div className="perf-stat">
                <span className="perf-label">Improvement</span>
                <span className="perf-value">+12%</span>
              </div>
            </div>

            <div className="performance-details">
              <h3>📋 Assessment Details</h3>
              <div className="perf-grid">
                {performanceList.slice(0, 10).map(perf => (
                  <div key={perf.id} className="perf-card">
                    <div className="perf-date">{perf.assessmentDate ? new Date(perf.assessmentDate).toLocaleDateString() : 'N/A'}</div>
                    <div className="perf-score">
                      <div className="score-circle">
                        {parseFloat(perf.overallScore || 0).toFixed(1)}
                      </div>
                    </div>
                    <div className="perf-breakdown">
                      <p>📚 Concept: {perf.conceptUnderstanding || '-'}</p>
                      <p>🛠️ Skills: {perf.practicalSkills || '-'}</p>
                      <p>💬 Comm: {perf.communication || '-'}</p>
                      <p>⏰ Punct: {perf.punctuality || '-'}</p>
                    </div>
                    <div className="perf-feedback">{perf.feedback || '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="student-content">
          <div className="profile-section">
            <h2>👤 Your Profile</h2>
            <div className="profile-card">
              <div className="profile-info">
                <h3>Personal Information</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <label>Full Name</label>
                    <span>{student.fullName}</span>
                  </div>
                  <div className="info-row">
                    <label>Email</label>
                    <span>{student.email}</span>
                  </div>
                  <div className="info-row">
                    <label>Phone</label>
                    <span>{student.mobile}</span>
                  </div>
                  <div className="info-row">
                    <label>Date of Birth</label>
                    <span>{student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <label>Gender</label>
                    <span>{student.gender}</span>
                  </div>
                  <div className="info-row">
                    <label>City</label>
                    <span>{student.city}, {student.state}</span>
                  </div>
                  <div className="info-row">
                    <label>Pin Code</label>
                    <span>{student.pinCode}</span>
                  </div>
                  <div className="info-row">
                    <label>Address</label>
                    <span>{student.address}</span>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button className="btn-edit">✏️ Edit Profile</button>
                <button className="btn-password">🔐 Change Password</button>
                <button className="btn-settings">⚙️ Settings</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPage;
