import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MentorPage.css';
import BackButton from './BackButton';

const MentorPage = ({ mentorId }) => {
  const params = useParams();
  const storedMentor = (() => {
    try {
      return JSON.parse(localStorage.getItem('mentor') || '{}');
    } catch (e) {
      return {};
    }
  })();
  const mentorIdToUse = mentorId || params.mentorId || storedMentor.id;
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  const [recordingAttendance, setRecordingAttendance] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    dates: [],
    status: 'present',
    studyHours: 2
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalStudent, setModalStudent] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // status now comes from student.status field which is 'active','inactive','suspended'
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('ranking');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!mentorIdToUse) {
      setLoading(false);
      return;
    }
    fetchStudents();
    if (activeTab === 'reviews') {
      fetchReviews();
      fetchCourses();
    }
    if (activeTab === 'attendance') {
      // load attendance records for mentor
      fetchAttendance();
    }
  }, [mentorIdToUse, activeTab]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/mentor/${mentorIdToUse}/students`);
      setStudents(response.data.students || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/mentor/${mentorIdToUse}/student/${studentId}`);
      setSelectedStudent(response.data.student);
      setAttendance(response.data.attendance || []);
      setPerformance(response.data.performance || []);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/mentor/${mentorIdToUse}/reviews`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/mentor/${mentorIdToUse}/courses`);
      let data = response.data.courses || [];
      
      // if no data, show dummy courses for demo
      if (data.length === 0) {
        const dummyCourses = [
          { id: 1, name: 'Web Development', icon: '🌐', students: 12, progress: '85%' },
          { id: 2, name: 'JavaScript Basics', icon: '📝', students: 18, progress: '92%' },
          { id: 3, name: 'React Advanced', icon: '⚛️', students: 9, progress: '78%' },
          { id: 4, name: 'Python Programming', icon: '🐍', students: 15, progress: '88%' },
          { id: 5, name: 'Data Science', icon: '📊', students: 10, progress: '80%' }
        ];
        data = dummyCourses;
      }
      
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // set dummy courses on error too
      const dummyCourses = [
        { id: 1, name: 'Web Development', icon: '🌐', students: 12, progress: '85%' },
        { id: 2, name: 'JavaScript Basics', icon: '📝', students: 18, progress: '92%' },
        { id: 3, name: 'React Advanced', icon: '⚛️', students: 9, progress: '78%' },
        { id: 4, name: 'Python Programming', icon: '🐍', students: 15, progress: '88%' },
        { id: 5, name: 'Data Science', icon: '📊', students: 10, progress: '80%' }
      ];
      setCourses(dummyCourses);
    }
  };

  const recordAttendance = async () => {
    if (!selectedStudent || attendanceForm.dates.length === 0) {
      alert('Please select dates');
      return;
    }

    try {
      for (let date of attendanceForm.dates) {
        await axios.post('http://localhost:5000/api/mentor/record-attendance', {
          studentId: selectedStudent.id,
          mentorId: mentorIdToUse,
          attendanceDate: date,
          status: attendanceForm.status,
          studyHours: attendanceForm.studyHours
        });
      }
      alert('✅ Attendance recorded successfully');
      setRecordingAttendance(false);
      setAttendanceForm({ dates: [], status: 'present', studyHours: 2 });
      fetchStudentDetails(selectedStudent.id);
    } catch (error) {
      alert('Error recording attendance: ' + error.response?.data?.error);
    }
  };

  const getAttendanceStats = () => {
    const stats = {
      present: 0,
      absent: 0,
      late: 0
    };
    attendance.forEach(a => {
      stats[a.status]++;
    });
    return stats;
  };

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/mentor/${mentorIdToUse}/attendance`);
      let data = response.data.attendance || [];
      
      // if no data, show dummy data for demo
      if (data.length === 0) {
        const dummyData = [
          { id: 1, fullName: 'Rahul Kumar', attendanceDate: new Date(Date.now() - 0*24*60*60*1000).toISOString().split('T')[0], status: 'present', studyHours: 3 },
          { id: 2, fullName: 'Priya Singh', attendanceDate: new Date(Date.now() - 1*24*60*60*1000).toISOString().split('T')[0], status: 'absent', studyHours: 0 },
          { id: 3, fullName: 'Amit Patel', attendanceDate: new Date(Date.now() - 2*24*60*60*1000).toISOString().split('T')[0], status: 'late', studyHours: 2.5 },
          { id: 4, fullName: 'Neha Sharma', attendanceDate: new Date(Date.now() - 3*24*60*60*1000).toISOString().split('T')[0], status: 'present', studyHours: 4 },
          { id: 5, fullName: 'Rahul Kumar', attendanceDate: new Date(Date.now() - 4*24*60*60*1000).toISOString().split('T')[0], status: 'present', studyHours: 3.5 },
          { id: 6, fullName: 'Priya Singh', attendanceDate: new Date(Date.now() - 5*24*60*60*1000).toISOString().split('T')[0], status: 'present', studyHours: 3 },
          { id: 7, fullName: 'Amit Patel', attendanceDate: new Date(Date.now() - 6*24*60*60*1000).toISOString().split('T')[0], status: 'present', studyHours: 2 },
          { id: 8, fullName: 'Neha Sharma', attendanceDate: new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0], status: 'absent', studyHours: 0 },
          { id: 9, fullName: 'Rohit Singh', attendanceDate: new Date(Date.now() - 8*24*60*60*1000).toISOString().split('T')[0], status: 'late', studyHours: 2.5 },
          { id: 10, fullName: 'Anjali Gupta', attendanceDate: new Date(Date.now() - 9*24*60*60*1000).toISOString().split('T')[0], status: 'present', studyHours: 4 },
        ];
        data = dummyData;
      }
      
      setAttendance(data);
    } catch (err) {
      console.error('Failed to fetch attendance', err);
      // set dummy data on error too
      const dummyData = [
        { id: 1, fullName: 'Rahul Kumar', attendanceDate: new Date(Date.now() - 0*24*60*60*1000).toISOString().split('T')[0], status: 'present', studyHours: 3 },
        { id: 2, fullName: 'Priya Singh', attendanceDate: new Date(Date.now() - 1*24*60*60*1000).toISOString().split('T')[0], status: 'absent', studyHours: 0 },
        { id: 3, fullName: 'Amit Patel', attendanceDate: new Date(Date.now() - 2*24*60*60*1000).toISOString().split('T')[0], status: 'late', studyHours: 2.5 },
        { id: 4, fullName: 'Neha Sharma', attendanceDate: new Date(Date.now() - 3*24*60*60*1000).toISOString().split('T')[0], status: 'present', studyHours: 4 },
        { id: 5, fullName: 'Rahul Kumar', attendanceDate: new Date(Date.now() - 4*24*60*60*1000).toISOString().split('T')[0], status: 'present', studyHours: 3.5 },
        { id: 6, fullName: 'Priya Singh', attendanceDate: new Date(Date.now() - 5*24*60*60*1000).toISOString().split('T')[0], status: 'present', studyHours: 3 },
        { id: 7, fullName: 'Amit Patel', attendanceDate: new Date(Date.now() - 6*24*60*60*1000).toISOString().split('T')[0], status: 'present', studyHours: 2 },
        { id: 8, fullName: 'Neha Sharma', attendanceDate: new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0], status: 'absent', studyHours: 0 },
        { id: 9, fullName: 'Rohit Singh', attendanceDate: new Date(Date.now() - 8*24*60*60*1000).toISOString().split('T')[0], status: 'late', studyHours: 2.5 },
        { id: 10, fullName: 'Anjali Gupta', attendanceDate: new Date(Date.now() - 9*24*60*60*1000).toISOString().split('T')[0], status: 'present', studyHours: 4 },
      ];
      setAttendance(dummyData);
    }
  };

  const getPerformanceAverage = () => {
    if (performance.length === 0) return 0;
    const avg = performance.reduce((sum, p) => sum + (parseFloat(p.overallScore) || 0), 0) / performance.length;
    return avg.toFixed(2);
  };

  const getTopRankedStudent = () => {
    if (students.length === 0) return null;
    return students.reduce((top, student) => {
      const topRank = parseFloat(top.ranking) || 0;
      const studentRank = parseFloat(student.ranking) || 0;
      return studentRank > topRank ? student : top;
    });
  };

  const openStudentModal = (student) => {
    setModalStudent(student);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setModalStudent(null), 300);
  };

  const openAttendanceModal = (record) => {
    setSelectedAttendanceRecord(record);
    setShowAttendanceModal(true);
  };

  const closeAttendanceModal = () => {
    setShowAttendanceModal(false);
    setTimeout(() => setSelectedAttendanceRecord(null), 300);
  };

  // Helper function to generate dummy avatar image URL
  const getAvatarUrl = (name, seed) => {
    if (!name) return `https://api.dicebear.com/7.x/avataaars/svg?seed=default`;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  };

  // Filter and sort students
  const getFilteredStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    if (sortBy === 'ranking') {
      filtered = [...filtered].sort((a, b) => (b.ranking || 0) - (a.ranking || 0));
    } else if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    return filtered;
  };

  if (loading) {
    return <div className="mentor-loader">Loading...</div>;
  }

  return (
    <div className="mentor-dashboard">
      <div className="page-back">
        <BackButton label="Back" />
      </div>
      <div className="mentor-header">
        <h1>📚 Mentor Dashboard</h1>
        <div className="mentor-nav-tabs">
          <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
            👥 Students ({students.length})
          </button>
          <button className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}>
            📋 Attendance
          </button>
          <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
            ⭐ Reviews
          </button>
        </div>
      </div>

      {/* STUDENTS LIST TAB */}
      {activeTab === 'students' && (
        <div className="mentor-content">
          {/* LEFT SIDEBAR FILTER */}
          <div className="filter-sidebar">
            <div className="filter-section">
              <h3>🔍 Search</h3>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-section">
              <h3>📊 Filter by Status</h3>
              <div className="filter-options">
                <label className="filter-label">
                  <input
                    type="radio"
                    name="status"
                    value="all"
                    checked={filterStatus === 'all'}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  />
                  <span>All Students</span>
                </label>
                <label className="filter-label">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={filterStatus === 'active'}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  />
                  <span>Active</span>
                </label>
                <label className="filter-label">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={filterStatus === 'inactive'}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  />
                  <span>Inactive</span>
                </label>
                <label className="filter-label">
                  <input
                    type="radio"
                    name="status"
                    value="suspended"
                    checked={filterStatus === 'suspended'}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  />
                  <span>Suspended</span>
                </label>
              </div>
            </div>

            <div className="filter-section">
              <h3>🔄 Sort By</h3>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                <option value="ranking">Top Performers ⭐</option>
                <option value="name">Alphabetical A-Z</option>
              </select>
            </div>

            <div className="filter-stats">
              <div className="stat-box">
                <div className="stat-count">{getFilteredStudents().length}</div>
                <div className="stat-label">Results</div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="students-container">
            <div className="students-list-section">
              <div className="section-header">
                <h2>Your Students ({getFilteredStudents().length})</h2>
                <div className="view-info">📍 Showing {getFilteredStudents().length} of {students.length}</div>
              </div>
              <div className="students-list">
                {getFilteredStudents().length > 0 ? (
                  getFilteredStudents().map(student => (
                    <div 
                      key={student.id} 
                      className={`student-card ${selectedStudent?.id === student.id ? 'active' : ''} ${student.status ? `status-${student.status}` : ''}`}
                      onClick={() => {
                        setSelectedStudent(student);
                        fetchStudentDetails(student.id);
                        openStudentModal(student);
                      }}
                    >
                      <div className="student-card-avatar">
                        <img 
                          src={getAvatarUrl(student.fullName)} 
                          alt={student.fullName}
                          className="avatar-img"
                        />
                      </div>
                      <div className="student-card-header">
                        <div className="student-name">{student.fullName}</div>
                        <span className={`student-status ${student.status}`}>{student.status.toUpperCase()}</span>
                      </div>
                      <div className="student-card-info">
                        <p>📧 {student.email}</p>
                        <p>📱 {student.mobile}</p>
                        <p>🏙️ {student.city}</p>
                      </div>
                        <div className="student-stats">
                          <span className="stat-item">⏱️ {student.dailyStudyMinutes} min/day</span>
                          <span className="stat-item rank-badge">🏆 #{student.ranking}</span>
                        </div>
                        <div className="student-card-actions">
                          <button
                            className="btn-open-student"
                            onClick={(e) => { e.stopPropagation(); navigate(`/student/${student.id}`); }}
                          >
                            👉 Open Student Page
                          </button>
                        </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <p>😔 No students found</p>
                    <p className="no-results-hint">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </div>

            {selectedStudent && (
              <div className="student-details-section">
                <h2>📖 Student Details - {selectedStudent.fullName}</h2>
                
                <div className="details-tabs">
                  <button className="tab-btn active">Profile</button>
                  <button className="tab-btn">Attendance</button>
                  <button className="tab-btn">Performance</button>
                </div>

                <div className="student-profile-card">
                  <div className="profile-info">
                    <h3>🎓 Personal Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Full Name</label>
                        <p>{selectedStudent.fullName}</p>
                      </div>
                      <div className="info-item">
                        <label>Email</label>
                        <p>{selectedStudent.email}</p>
                      </div>
                      <div className="info-item">
                        <label>Phone</label>
                        <p>{selectedStudent.mobile}</p>
                      </div>
                      <div className="info-item">
                        <label>Date of Birth</label>
                        <p>{new Date(selectedStudent.dob).toLocaleDateString()}</p>
                      </div>
                      <div className="info-item">
                        <label>Gender</label>
                        <p>{selectedStudent.gender}</p>
                      </div>
                      <div className="info-item">
                        <label>City</label>
                        <p>{selectedStudent.city}, {selectedStudent.state}</p>
                      </div>
                    </div>
                  </div>

                  <div className="attendance-summary">
                    <h3>📊 Attendance Summary</h3>
                    {(() => {
                      const stats = getAttendanceStats();
                      const total = Object.values(stats).reduce((a, b) => a + b, 0);
                      return (
                        <div className="stats-grid">
                          <div className="stat-box present">
                            <div className="stat-number">{stats.present}</div>
                            <div className="stat-label">Present</div>
                          </div>
                          <div className="stat-box absent">
                            <div className="stat-number">{stats.absent}</div>
                            <div className="stat-label">Absent</div>
                          </div>
                          <div className="stat-box late">
                            <div className="stat-number">{stats.late}</div>
                            <div className="stat-label">Late</div>
                          </div>
                          <div className="stat-box">
                            <div className="stat-number">{total}</div>
                            <div className="stat-label">Total Days</div>
                          </div>
                        </div>
                      );
                    })()}
                    <button className="btn-record-attendance" onClick={() => setRecordingAttendance(!recordingAttendance)}>
                      {recordingAttendance ? '❌ Cancel' : '✅ Record Attendance'}
                    </button>
                  </div>

                  {recordingAttendance && (
                    <div className="attendance-form">
                      <h4>Record Attendance</h4>
                      <div className="form-group">
                        <label>Date</label>
                        <input 
                          type="date" 
                          onChange={(e) => setAttendanceForm({...attendanceForm, dates: [e.target.value]})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select 
                          value={attendanceForm.status}
                          onChange={(e) => setAttendanceForm({...attendanceForm, status: e.target.value})}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Study Hours</label>
                        <input 
                          type="number" 
                          step="0.5"
                          min="0"
                          max="8"
                          value={attendanceForm.studyHours}
                          onChange={(e) => setAttendanceForm({...attendanceForm, studyHours: parseFloat(e.target.value)})}
                        />
                      </div>
                      <button className="btn-save" onClick={recordAttendance}>💾 Save</button>
                    </div>
                  )}

                  <div className="performance-summary">
                    <h3>📈 Performance Overview</h3>
                    <div className="performance-average">
                      <p>Average Score: <strong>{getPerformanceAverage()}/100</strong></p>
                    </div>
                    {performance.length > 0 ? (
                      <div className="performance-list">
                        {performance.slice(0, 5).map(p => (
                          <div key={p.id} className="performance-item">
                            <div className="perf-date">{new Date(p.assessmentDate).toLocaleDateString()}</div>
                            <div className="perf-scores">
                              <span>Concept: {p.conceptUnderstanding}</span>
                              <span>Skills: {p.practicalSkills}</span>
                              <span>Comm: {p.communication}</span>
                            </div>
                            <div className="perf-overall">{parseFloat(p.overallScore).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data">No performance records yet</p>
                    )}
                  </div>
                </div>

                {/* TOP RANKED STUDENT CARD */}
                {(() => {
                  const topStudent = getTopRankedStudent();
                  return topStudent ? (
                    <div className="top-ranked-student-card">
                      <div className="top-student-header">
                        <div className="trophy-icon">🏆</div>
                        <h3>TOP PERFORMER</h3>
                      </div>
                      <div className="top-student-content">
                        <div className="top-student-name">{topStudent.fullName}</div>
                        <div className="top-student-rank">Rank: <span>{topStudent.ranking}</span></div>
                        <div className="top-student-stats">
                          <div className="stat-item">
                            <span className="stat-icon">⏱️</span>
                            <span className="stat-text">{topStudent.dailyStudyMinutes || 0} min/day</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-icon">📧</span>
                            <span className="stat-text">{topStudent.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className={`mentor-content ${activeTab==='attendance' ? 'full-view' : ''}`}>
          <div className="attendance-container">
            <h2>📋 Attendance Records</h2>
            <div className="attendance-table">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Study Hours</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map(record => (
                    <tr key={record.id} onClick={() => openAttendanceModal(record)} className="clickable-row">
                      <td>{record.fullName || record.studentName || record.student?.fullName || 'N/A'}</td>
                      <td>{new Date(record.attendanceDate).toLocaleDateString()}</td>
                      <td><span className={`attendance-badge ${record.status}`}>{record.status}</span></td>
                      <td>{record.studyHours}h</td>
                      <td>{record.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendance.length === 0 && <p className="no-data">No attendance records</p>}
            </div>
          </div>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className={`mentor-content ${activeTab==='attendance' || activeTab==='reviews' ? 'full-view' : ''}`}>
          <div className="reviews-container">
            <h2>⭐ Student Reviews</h2>
            <div className="reviews-stats">
              <div className="review-stat">
                <span className="stat-label">Total Reviews</span>
                <span className="stat-value">{reviews.length}</span>
              </div>
              
              <div className="course-stat">
                <span className="stat-label">📚 My Courses</span>
                <div className="courses-minilist">
                  {courses.slice(0, 3).map(course => (
                    <div key={course.id} className="course-item">
                      <span className="course-icon">{course.icon}</span>
                      <span className="course-name">{course.name}</span>
                      <span className="course-count">{course.students} 👥</span>
                    </div>
                  ))}
                </div>
                <span className="stat-label-small">+ {Math.max(0, courses.length - 3)} more</span>
              </div>

              <div className="review-stat">
                <span className="stat-label">Average Rating</span>
                <span className="stat-value">
                  {reviews.length > 0 
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
                    : 'N/A'} ⭐
                </span>
              </div>
            </div>

            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <h4>{review.studentName}</h4>
                    <div className="rating">
                      {'⭐'.repeat(review.rating)}<span className="rating-num">{review.rating}/5</span>
                    </div>
                  </div>
                  <p className="review-text">{review.review}</p>
                  <p className="review-date">{new Date(review.reviewDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            {reviews.length === 0 && <p className="no-data">No reviews yet</p>}
          </div>
        </div>
      )}

      {/* ATTENDANCE DETAIL MODAL */}
      {showAttendanceModal && selectedAttendanceRecord && (
        <div className="modal-overlay" onClick={closeAttendanceModal}>
          <div className="attendance-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Attendance Record Details</h2>
              <button className="modal-close" onClick={closeAttendanceModal}>✕</button>
            </div>
            <div className="attendance-record-details">
              <div className="detail-row">
                <span className="detail-label">👤 Student Name:</span>
                <span className="detail-value">{selectedAttendanceRecord.fullName || selectedAttendanceRecord.studentName || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">📅 Date:</span>
                <span className="detail-value">{new Date(selectedAttendanceRecord.attendanceDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">✓ Status:</span>
                <span className="detail-value">
                  <span className={`attendance-badge ${selectedAttendanceRecord.status}`}>
                    {selectedAttendanceRecord.status.toUpperCase()}
                  </span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">⏱️ Study Hours:</span>
                <span className="detail-value">{selectedAttendanceRecord.studyHours}h</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">📝 Remarks:</span>
                <span className="detail-value">{selectedAttendanceRecord.remarks || 'No remarks'}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={closeAttendanceModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      {showModal && modalStudent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <img 
                  src={getAvatarUrl(modalStudent.fullName)} 
                  alt={modalStudent.fullName}
                  className="modal-avatar"
                />
                <h2>👤 {modalStudent.fullName}</h2>
              </div>
              <button
                className="btn-open-student"
                onClick={(e) => { e.stopPropagation(); navigate(`/student/${modalStudent.id}`); }}
              >
                👉 Open Student Page
              </button>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-student-info">
              <div className="modal-info-item">
                <span className="modal-info-item-label">📧 Email</span>
                <p className="modal-info-item-value">{modalStudent.email}</p>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-item-label">📱 Mobile</span>
                <p className="modal-info-item-value">{modalStudent.mobile || 'N/A'}</p>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-item-label">🏙️ City</span>
                <p className="modal-info-item-value">{modalStudent.city}</p>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-item-label">📅 DOB</span>
                <p className="modal-info-item-value">{modalStudent.dob ? new Date(modalStudent.dob).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="modal-stats-grid">
              <div className="modal-stat-box">
                <span className="modal-stat-number">{modalStudent.ranking || 0}</span>
                <span className="modal-stat-label">🏆 Rank</span>
              </div>
              <div className="modal-stat-box">
                <span className="modal-stat-number">{modalStudent.dailyStudyMinutes || 0}</span>
                <span className="modal-stat-label">⏱️ Daily Study (min)</span>
              </div>
            </div>

            <div className="modal-divider"></div>

            {attendance.length > 0 && (
              <div className="modal-section">
                <h3>📊 Attendance Summary</h3>
                {(() => {
                  const stats = getAttendanceStats();
                  return (
                    <p>Present: <strong>{stats.present}</strong> | Absent: <strong>{stats.absent}</strong> | Late: <strong>{stats.late}</strong></p>
                  );
                })()}
              </div>
            )}

            {performance.length > 0 && (
              <div className="modal-section">
                <h3>📈 Performance Average</h3>
                <p>Overall Score: <strong>{getPerformanceAverage()}/100</strong></p>
              </div>
            )}

            {selectedStudent?.gender && (
              <div className="modal-section">
                <h3>ℹ️ Additional Info</h3>
                <p>Gender: <strong>{selectedStudent.gender}</strong></p>
                <p>State: <strong>{selectedStudent.state}</strong></p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorPage;
