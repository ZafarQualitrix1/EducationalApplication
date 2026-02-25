const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

// ✅ Load environment variables based on NODE_ENV
dotenv.config({ path: path.join(__dirname, `.env.${process.env.NODE_ENV || "development"}`) });

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "uploads")));
app.use(helmet());
app.use(compression());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// ========================= DATABASE CONNECTION =========================
const DB_PORT = parseInt(process.env.DB_PORT) || 3306;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: DB_PORT
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error(`❌ Database connection failed (${process.env.NODE_ENV}) on port ${DB_PORT}:`, err);
  } else {
    console.log(`✅ Connected to MySQL database (${process.env.NODE_ENV}) on port ${DB_PORT}`);
  }
});

// ========================= HELPER FUNCTIONS =========================

// Get user role based on table
const getUserRole = (email, callback) => {
  db.query("SELECT 'student' as role FROM students WHERE email = ? UNION SELECT 'mentor' as role FROM mentors WHERE email = ? UNION SELECT 'admin' as role FROM admins WHERE email = ?", [email, email, email], (err, results) => {
    if (err || !results.length) return callback(null);
    callback(results[0].role);
  });
};

// ========================= STUDENT SIGNUP API =========================
app.post("/api/signup", async (req, res) => {
  const { fullName, email, mobile, dob, gender, address, city, state, pinCode, password, profileImage } = req.body;

  if (!fullName || !email || !mobile || !dob || !gender || !address || !city || !state || !pinCode || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.query("SELECT * FROM students WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length > 0) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO students (fullName, email, mobile, dob, gender, address, city, state, pinCode, password, profileImage, dailyStudyMinutes, ranking, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [fullName, email, mobile, dob, gender, address, city, state, pinCode, hashedPassword, profileImage || null, 0, 0, 'active'], (err, result) => {
      if (err) return res.status(500).json({ error: "Error creating user" });
      const prn = result.insertId;
      res.json({ 
        message: "✅ Student registered successfully",
        prn: prn,
        email: email,
        fullName: fullName,
        id: prn,
        role: "student"
      });
    });
  });
});

// ========================= MENTOR SIGNUP API =========================
app.post("/api/mentor-signup", async (req, res) => {
  const { username, email, password, fullName, phone, specialization, city, state, yearsOfExperience } = req.body;

  if (!username || !email || !password || !fullName) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  db.query("SELECT * FROM mentors WHERE email = ? OR username = ?", [email, username], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length > 0) return res.status(400).json({ error: "Mentor already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO mentors (username, email, password, fullName, phone, specialization, city, state, yearsOfExperience, verificationStatus, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [username, email, hashedPassword, fullName, phone || null, specialization || null, city || null, state || null, yearsOfExperience || 0, 'pending', 'active'], (err, result) => {
      if (err) return res.status(500).json({ error: "Error creating mentor" });
      const mentorId = result.insertId;
      res.json({ 
        message: "✅ Mentor registered successfully (awaiting verification)",
        mentorId: mentorId,
        email: email,
        fullName: fullName,
        role: "mentor"
      });
    });
  });
});

// ========================= STUDENT LOGIN API =========================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  db.query("SELECT * FROM students WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(400).json({ error: "User not found" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.json({
      message: "✅ Login successful",
      user: { 
        id: user.id, 
        prn: user.id,
        fullName: user.fullName, 
        email: user.email,
        profileImage: user.profileImage,
        dailyStudyMinutes: user.dailyStudyMinutes || 0,
        ranking: user.ranking || 0,
        mentorId: user.mentorId,
        role: "student"
      }
    });
  });
});

// ========================= MENTOR LOGIN API =========================
app.post("/api/mentor-login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  db.query("SELECT * FROM mentors WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(400).json({ error: "Mentor not found" });

    const mentor = results[0];
    
    if (mentor.status !== 'active') {
      return res.status(403).json({ error: "Your account is not active" });
    }

    const isMatch = await bcrypt.compare(password, mentor.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.json({
      message: "✅ Mentor login successful",
      user: {
        id: mentor.id,
        username: mentor.username,
        email: mentor.email,
        fullName: mentor.fullName,
        profileImage: mentor.profileImage,
        specialization: mentor.specialization,
        yearsOfExperience: mentor.yearsOfExperience,
        totalStudents: mentor.totalStudents,
        averageRating: mentor.averageRating,
        verificationStatus: mentor.verificationStatus,
        role: "mentor"
      }
    });
  });
});

// ========================= ADMIN LOGIN API =========================
app.post("/api/admin-login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(400).json({ error: "Admin not found" });

    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.json({
      message: "✅ Admin login successful",
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        fullName: admin.fullName,
        role: admin.role
      }
    });
  });
});

// ========================= MENTOR DASHBOARD APIs =========================

// Get all students under a mentor
app.get("/api/mentor/:mentorId/students", (req, res) => {
  const { mentorId } = req.params;

  const query = `SELECT id, fullName, email, mobile, city, dailyStudyMinutes, ranking, status FROM students WHERE mentorId = ? ORDER BY id DESC`;
  
  db.query(query, [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ 
      total: results.length,
      students: results 
    });
  });
});

// Get student details with performance
app.get("/api/mentor/:mentorId/student/:studentId", (req, res) => {
  const { mentorId, studentId } = req.params;

  db.query("SELECT * FROM students WHERE id = ? AND mentorId = ?", [studentId, mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "Student not found" });

    const student = results[0];

    // Get attendance
    db.query("SELECT * FROM attendance WHERE studentId = ? AND mentorId = ? ORDER BY attendanceDate DESC LIMIT 30", [studentId, mentorId], (err, attendance) => {
      if (err) attendance = [];

      // Get performance
      db.query("SELECT * FROM studentPerformance WHERE studentId = ? AND mentorId = ? ORDER BY assessmentDate DESC LIMIT 10", [studentId, mentorId], (err, performance) => {
        if (err) performance = [];

        res.json({
          student,
          attendance: attendance || [],
          performance: performance || []
        });
      });
    });
  });
});

// Get mentor attendance
app.get("/api/mentor/:mentorId/attendance", (req, res) => {
  const { mentorId } = req.params;
  const { startDate, endDate } = req.query;

  let query = "SELECT a.*, s.fullName FROM attendance a JOIN students s ON a.studentId = s.id WHERE a.mentorId = ?";
  const params = [mentorId];

  if (startDate) {
    query += " AND a.attendanceDate >= ?";
    params.push(startDate);
  }
  if (endDate) {
    query += " AND a.attendanceDate <= ?";
    params.push(endDate);
  }

  query += " ORDER BY a.attendanceDate DESC";

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ attendance: results });
  });
});

// Record attendance
app.post("/api/mentor/record-attendance", (req, res) => {
  const { studentId, mentorId, attendanceDate, status, studyHours, remarks } = req.body;

  if (!studentId || !mentorId || !attendanceDate || !status) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  const query = `INSERT INTO attendance (studentId, mentorId, attendanceDate, status, studyHours, remarks) 
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE status = ?, studyHours = ?, remarks = ?`;

  db.query(query, [studentId, mentorId, attendanceDate, status, studyHours || 0, remarks || null, status, studyHours || 0, remarks || null], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "✅ Attendance recorded" });
  });
});

// Get mentor reviews
app.get("/api/mentor/:mentorId/reviews", (req, res) => {
  const { mentorId } = req.params;

  db.query(`SELECT mr.*, s.fullName as studentName FROM mentorReviews mr 
            JOIN students s ON mr.studentId = s.id 
            WHERE mr.mentorId = ? ORDER BY mr.reviewDate DESC`, [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    
    const avgRating = results.length > 0 
      ? (results.reduce((sum, r) => sum + r.rating, 0) / results.length).toFixed(2)
      : 0;

    res.json({ 
      reviews: results,
      totalReviews: results.length,
      averageRating: avgRating
    });
  });
});

// ========================= ADMIN DASHBOARD APIs =========================

// Get all students
app.get("/api/admin/students", (req, res) => {
  const query = `SELECT s.*, m.fullName as mentorName FROM students s 
                 LEFT JOIN mentors m ON s.mentorId = m.id 
                 ORDER BY s.id DESC`;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ 
      total: results.length,
      students: results 
    });
  });
});

// Get all mentors
app.get("/api/admin/mentors", (req, res) => {
  const query = `SELECT id, username, email, fullName, phone, specialization, city, state, yearsOfExperience, 
                 verificationStatus, totalStudents, averageRating, status, createdAt FROM mentors ORDER BY id DESC`;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ 
      total: results.length,
      mentors: results 
    });
  });
});

// Get mentor details with analytics
app.get("/api/admin/mentor/:mentorId/details", (req, res) => {
  const { mentorId } = req.params;

  db.query("SELECT * FROM mentors WHERE id = ?", [mentorId], (err, mentor) => {
    if (err || !mentor.length) return res.status(500).json({ error: "Mentor not found" });

    // Get students count
    db.query("SELECT COUNT(*) as count FROM students WHERE mentorId = ?", [mentorId], (err, result) => {
      const studentCount = result[0].count;

      // Get reviews
      db.query("SELECT AVG(rating) as avgRating FROM mentorReviews WHERE mentorId = ?", [mentorId], (err, review) => {
        const avgRating = review[0].avgRating || 0;

        // Get financial data
        db.query("SELECT * FROM financialTracking WHERE mentorId = ? ORDER BY transactionMonth DESC LIMIT 12", [mentorId], (err, financial) => {
          const financialData = financial || [];

          res.json({
            mentor: mentor[0],
            studentCount,
            averageRating: avgRating.toFixed(2),
            financialData
          });
        });
      });
    });
  });
});

// Get all attendance records
app.get("/api/admin/attendance", (req, res) => {
  const { startDate, endDate } = req.query;

  let query = `SELECT a.*, s.fullName as studentName, m.fullName as mentorName 
               FROM attendance a 
               JOIN students s ON a.studentId = s.id 
               JOIN mentors m ON a.mentorId = m.id 
               WHERE 1=1`;
  const params = [];

  if (startDate) {
    query += " AND a.attendanceDate >= ?";
    params.push(startDate);
  }
  if (endDate) {
    query += " AND a.attendanceDate <= ?";
    params.push(endDate);
  }

  query += " ORDER BY a.attendanceDate DESC";

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ attendance: results });
  });
});

// Get financial overview
app.get("/api/admin/financial-overview", (req, res) => {
  db.query(`SELECT 
              COUNT(DISTINCT m.id) as totalMentors,
              COUNT(DISTINCT c.id) as totalCourses,
              COALESCE(SUM(f.totalRevenue), 0) as totalRevenue,
              COALESCE(SUM(f.adminCommission), 0) as totalAdminCommission,
              COALESCE(SUM(f.mentorEarnings), 0) as totalMentorEarnings
              FROM mentors m 
              LEFT JOIN courses c ON m.id = c.mentorId
              LEFT JOIN financialTracking f ON m.id = f.mentorId`, [], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    
    db.query("SELECT * FROM financialTracking ORDER BY transactionMonth DESC LIMIT 12", [], (err, monthly) => {
      res.json({
        overview: results[0],
        monthlyData: monthly || []
      });
    });
  });
});

// Get dashboard statistics
app.get("/api/admin/dashboard-stats", (req, res) => {
  Promise.all([
    new Promise((resolve) => {
      db.query("SELECT COUNT(*) as count FROM students", [], (err, result) => {
        resolve(result[0].count);
      });
    }),
    new Promise((resolve) => {
      db.query("SELECT COUNT(*) as count FROM mentors WHERE verificationStatus = 'verified'", [], (err, result) => {
        resolve(result[0].count);
      });
    }),
    new Promise((resolve) => {
      db.query("SELECT COUNT(*) as count FROM mentors WHERE verificationStatus = 'pending'", [], (err, result) => {
        resolve(result[0].count);
      });
    }),
    new Promise((resolve) => {
      db.query("SELECT COUNT(*) as count FROM courses", [], (err, result) => {
        resolve(result[0].count);
      });
    }),
    new Promise((resolve) => {
      db.query("SELECT COALESCE(SUM(totalRevenue), 0) as revenue FROM financialTracking", [], (err, result) => {
        resolve(result[0].revenue);
      });
    })
  ]).then(([totalStudents, verifiedMentors, pendingMentors, totalCourses, totalRevenue]) => {
    res.json({
      totalStudents,
      verifiedMentors,
      pendingMentors,
      totalCourses,
      totalRevenue: parseFloat(totalRevenue) || 0
    });
  });
});

// Verify mentor
app.post("/api/admin/verify-mentor", (req, res) => {
  const { mentorId, status } = req.body;

  if (!['verified', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  db.query("UPDATE mentors SET verificationStatus = ? WHERE id = ?", [status, mentorId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: `✅ Mentor ${status}` });
  });
});

// Assign mentor to student
app.post("/api/admin/assign-mentor", (req, res) => {
  const { studentId, mentorId } = req.body;

  if (!studentId || !mentorId) {
    return res.status(400).json({ error: "Student ID and Mentor ID required" });
  }

  db.query("UPDATE students SET mentorId = ? WHERE id = ?", [mentorId, studentId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });

    // Update total students count for mentor
    db.query("UPDATE mentors SET totalStudents = (SELECT COUNT(*) FROM students WHERE mentorId = ?) WHERE id = ?", [mentorId, mentorId], () => {
      res.json({ message: "✅ Mentor assigned" });
    });
  });
});

// ========================= STUDENT DASHBOARD APIs =========================

// Get student dashboard
app.get("/api/student/:studentId/dashboard", (req, res) => {
  const { studentId } = req.params;

  db.query("SELECT * FROM students WHERE id = ?", [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "Student not found" });

    const student = results[0];

    // Get attendance
    db.query("SELECT * FROM attendance WHERE studentId = ? ORDER BY attendanceDate DESC LIMIT 30", [studentId], (err, attendance) => {
      attendance = attendance || [];

      // Get performance
      db.query("SELECT * FROM studentPerformance WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 10", [studentId], (err, performance) => {
        performance = performance || [];

        res.json({
          student,
          attendance,
          performance
        });
      });
    });
  });
});

// Get student attendance
app.get("/api/student/:studentId/attendance", (req, res) => {
  const { studentId } = req.params;

  db.query("SELECT * FROM attendance WHERE studentId = ? ORDER BY attendanceDate DESC", [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ attendance: results });
  });
});

// Get student performance
app.get("/api/student/:studentId/performance", (req, res) => {
  const { studentId } = req.params;

  db.query("SELECT * FROM studentPerformance WHERE studentId = ? ORDER BY assessmentDate DESC", [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    
    const avgScore = results.length > 0 
      ? (results.reduce((sum, r) => sum + (r.overallScore || 0), 0) / results.length).toFixed(2)
      : 0;

    res.json({ 
      performance: results,
      averageScore: avgScore
    });
  });
});

// Add student performance
app.post("/api/mentor/add-performance", (req, res) => {
  const { studentId, mentorId, assessmentDate, conceptUnderstanding, practicalSkills, communication, punctuality, feedback } = req.body;

  if (!studentId || !mentorId || !assessmentDate) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  const overallScore = ((conceptUnderstanding + practicalSkills + communication + punctuality) / 4).toFixed(2);

  const query = `INSERT INTO studentPerformance (studentId, mentorId, assessmentDate, conceptUnderstanding, practicalSkills, communication, punctuality, overallScore, feedback) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [studentId, mentorId, assessmentDate, conceptUnderstanding || 0, practicalSkills || 0, communication || 0, punctuality || 0, overallScore, feedback || null], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "✅ Performance recorded" });
  });
});

// ========================= SERVER START =========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
