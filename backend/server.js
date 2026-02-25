const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
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

// ========================= SIGNUP API =========================
app.post("/signup", async (req, res) => {
  const { fullName, email, mobile, dob, gender, address, city, state, pinCode, password, profileImage } = req.body;

  if (!fullName || !email || !mobile || !dob || !gender || !address || !city || !state || !pinCode || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.query("SELECT * FROM students WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length > 0) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO students (fullName, email, mobile, dob, gender, address, city, state, pinCode, password, profileImage, dailyStudyMinutes, ranking) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [fullName, email, mobile, dob, gender, address, city, state, pinCode, hashedPassword, profileImage || null, 0, 0], (err, result) => {
      if (err) return res.status(500).json({ error: "Error creating user" });
      const prn = result.insertId;
      res.json({ 
        message: "✅ Student registered successfully",
        prn: prn,
        email: email,
        fullName: fullName,
        id: prn
      });
    });
  });
});

// ========================= LOGIN API =========================
app.post("/login", (req, res) => {
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
        ranking: user.ranking || 0
      }
    });
  });
});

// ========================= DASHBOARD API =========================
app.get("/dashboard/:userId", (req, res) => {
  const { userId } = req.params;

  db.query("SELECT * FROM students WHERE id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(400).json({ error: "User not found" });

    const user = results[0];
    res.json({
      user: {
        id: user.id,
        prn: user.id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        dailyStudyMinutes: user.dailyStudyMinutes || 0,
        ranking: user.ranking || 0,
        mobile: user.mobile,
        city: user.city
      }
    });
  });
});

// ========================= UPDATE DAILY STUDY =========================
app.post("/update-study", (req, res) => {
  const { userId, minutes } = req.body;

  if (!userId || !minutes) return res.status(400).json({ error: "User ID and minutes required" });

  db.query("UPDATE students SET dailyStudyMinutes = dailyStudyMinutes + ? WHERE id = ?", [minutes, userId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "✅ Study time updated" });
  });
});

// ========================= UPDATE PROFILE IMAGE =========================
app.post("/update-profile-image", (req, res) => {
  const { userId, profileImage } = req.body;

  if (!userId || !profileImage) return res.status(400).json({ error: "User ID and image required" });

  db.query("UPDATE students SET profileImage = ? WHERE id = ?", [profileImage, userId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "✅ Profile image updated" });
  });
});

// ========================= GET RANKING =========================
app.get("/ranking", (req, res) => {
  db.query("SELECT id, prn, fullName, dailyStudyMinutes, ranking FROM students ORDER BY dailyStudyMinutes DESC LIMIT 10", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ ranking: results });
  });
});

// ========================= ADMIN LOGIN =========================
app.post("/admin-login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  db.query("SELECT * FROM admins WHERE username = ? OR email = ?", [username, username], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(400).json({ error: "Admin not found" });

    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.json({
      message: "✅ Admin login successful",
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  });
});

// ========================= GET ALL STUDENTS (ADMIN) =========================
app.get("/admin/students", (req, res) => {
  const query = `SELECT id, prn, fullName, email, mobile, city, dailyStudyMinutes, ranking FROM students ORDER BY id DESC`;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ 
      total: results.length,
      students: results 
    });
  });
});

// ========================= GET STUDENT PROFILE (ADMIN) =========================
app.get("/admin/student/:studentId", (req, res) => {
  const { studentId } = req.params;

  db.query("SELECT * FROM students WHERE id = ?", [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(400).json({ error: "Student not found" });

    const student = results[0];
    res.json({
      student: {
        id: student.id,
        prn: student.prn,
        fullName: student.fullName,
        email: student.email,
        mobile: student.mobile,
        dob: student.dob,
        gender: student.gender,
        address: student.address,
        city: student.city,
        state: student.state,
        pinCode: student.pinCode,
        profileImage: student.profileImage,
        dailyStudyMinutes: student.dailyStudyMinutes,
        ranking: student.ranking,
        createdAt: student.createdAt
      }
    });
  });
});

// ========================= GET ALL MENTORS (ADMIN) =========================
app.get("/admin/mentors", (req, res) => {
  const query = `SELECT id, fullName, email, specialization, experience, rating, students_count FROM mentors ORDER BY id DESC`;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ 
      total: results.length,
      mentors: results 
    });
  });
});

// ========================= GET MENTOR PROFILE (ADMIN) =========================
app.get("/admin/mentor/:mentorId", (req, res) => {
  const { mentorId } = req.params;

  db.query("SELECT * FROM mentors WHERE id = ?", [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(400).json({ error: "Mentor not found" });

    const mentor = results[0];
    res.json({
      mentor: {
        id: mentor.id,
        fullName: mentor.fullName,
        email: mentor.email,
        specialization: mentor.specialization,
        bio: mentor.bio,
        profileImage: mentor.profileImage,
        mobile: mentor.mobile,
        experience: mentor.experience,
        rating: mentor.rating,
        students_count: mentor.students_count,
        createdAt: mentor.createdAt
      }
    });
  });
});

// ========================= MENTOR LOGIN =========================
app.post("/mentor-login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  db.query("SELECT * FROM mentors WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(400).json({ error: "Mentor not found" });

    const mentor = results[0];
    const isMatch = await bcrypt.compare(password, mentor.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.json({
      message: "✅ Mentor login successful",
      mentor: {
        id: mentor.id,
        fullName: mentor.fullName,
        email: mentor.email,
        specialization: mentor.specialization,
        profileImage: mentor.profileImage,
        rating: mentor.rating,
        students_count: mentor.students_count
      }
    });
  });
});

// ========================= GET ALL MENTORS (STUDENT VIEW) =========================
app.get("/mentors", (req, res) => {
  const query = `SELECT id, fullName, specialization, bio, profileImage, experience, rating, students_count FROM mentors ORDER BY rating DESC`;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ 
      total: results.length,
      mentors: results 
    });
  });
});

// ========================= GET MENTOR PROFILE (STUDENT VIEW) =========================
app.get("/mentor/:mentorId", (req, res) => {
  const { mentorId } = req.params;

  db.query("SELECT id, fullName, specialization, bio, profileImage, email, mobile, experience, rating, students_count FROM mentors WHERE id = ?", [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(400).json({ error: "Mentor not found" });

    const mentor = results[0];
    res.json({ mentor });
  });
});

// ========================= GET MENTOR'S STUDENTS =========================
app.get("/mentor/:mentorId/students", (req, res) => {
  const { mentorId } = req.params;

  const query = `SELECT s.id, s.prn, s.fullName, s.email, s.city, s.dailyStudyMinutes, s.ranking 
                 FROM students s
                 LIMIT 20`;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ 
      total: results.length,
      students: results 
    });
  });
});

// ========================= GET ALL COURSES =========================
app.get("/courses", (req, res) => {
  const query = `SELECT id, courseName, category, level, duration, price, rating, students_enrolled FROM courses ORDER BY id DESC`;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ 
      total: results.length,
      courses: results 
    });
  });
});

// ========================= GET COURSE DETAILS =========================
app.get("/course/:courseId", (req, res) => {
  const { courseId } = req.params;

  db.query("SELECT * FROM courses WHERE id = ?", [courseId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(400).json({ error: "Course not found" });

    const course = results[0];
    res.json({ course });
  });
});

// ========================= GET ALL VIDEOS =========================
app.get("/videos", (req, res) => {
  const query = `SELECT id, title, duration, views, category, thumbnail FROM videos ORDER BY id DESC`;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ 
      total: results.length,
      videos: results 
    });
  });
});

// ========================= GET VIDEOS BY CATEGORY =========================
app.get("/videos/category/:category", (req, res) => {
  const { category } = req.params;

  const query = `SELECT id, title, duration, views, category, thumbnail FROM videos WHERE category = ? ORDER BY views DESC`;
  
  db.query(query, [category], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ 
      total: results.length,
      videos: results 
    });
  });
});

// ========================= GET ADMIN DASHBOARD STATS =========================
app.get("/api/admin/dashboard-stats", (req, res) => {
  db.query("SELECT COUNT(*) as total FROM students", (err, studentResults) => {
    if (err) {
      console.error("❌ ERROR in students query:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    db.query("SELECT COUNT(*) as total FROM mentors WHERE verificationStatus = 'verified'", (err, verifiedResults) => {
      if (err) {
        console.error("❌ ERROR in verified mentors query:", err);
        return res.status(500).json({ error: "Database error", details: err.message });
      }

      db.query("SELECT COUNT(*) as total FROM mentors WHERE verificationStatus = 'pending'", (err, pendingResults) => {
        if (err) {
          console.error("❌ ERROR in pending mentors query:", err);
          return res.status(500).json({ error: "Database error", details: err.message });
        }

        db.query("SELECT COUNT(*) as total FROM courses", (err, courseResults) => {
          if (err) {
            console.error("❌ ERROR in courses query:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
          }

          db.query("SELECT COALESCE(SUM(totalRevenue), 0) as total FROM financialTracking", (err, revenueResults) => {
            if (err) {
              console.error("❌ ERROR in revenue query:", err);
              return res.status(500).json({ error: "Database error", details: err.message });
            }

            res.json({
              totalStudents: studentResults[0].total || 0,
              verifiedMentors: verifiedResults[0].total || 0,
              pendingMentors: pendingResults[0].total || 0,
              totalCourses: courseResults[0].total || 0,
              totalRevenue: revenueResults[0].total || 0
            });
          });
        });
      });
    });
  });
});

// ========================= GET ALL STUDENTS (ADMIN) WITH API PREFIX =========================
app.get("/api/admin/students", (req, res) => {
  db.query("SELECT s.*, m.fullName as mentorName FROM students s LEFT JOIN mentors m ON s.mentorId = m.id LIMIT 50", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ students: results });
  });
});

// ========================= GET ALL MENTORS (ADMIN) WITH API PREFIX =========================
app.get("/api/admin/mentors", (req, res) => {
  db.query("SELECT * FROM mentors LIMIT 20", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ mentors: results });
  });
});

// ========================= GET ATTENDANCE (ADMIN) =========================
app.get("/api/admin/attendance", (req, res) => {
  db.query(`SELECT a.*, s.fullName as studentName, m.fullName as mentorName 
            FROM attendance a 
            LEFT JOIN students s ON a.studentId = s.id 
            LEFT JOIN mentors m ON a.mentorId = m.id 
            ORDER BY a.attendanceDate DESC LIMIT 100`, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ attendance: results });
  });
});

// ========================= GET FINANCIAL OVERVIEW (ADMIN) =========================
app.get("/api/admin/financial-overview", (req, res) => {
  db.query("SELECT * FROM financialTracking ORDER BY transactionMonth DESC LIMIT 100", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    const totalRevenue = results.reduce((sum, r) => sum + (parseFloat(r.totalRevenue) || 0), 0);
    const totalAdminCommission = results.reduce((sum, r) => sum + (parseFloat(r.adminCommission) || 0), 0);
    const totalMentorEarnings = results.reduce((sum, r) => sum + (parseFloat(r.mentorEarnings) || 0), 0);

    res.json({
      overview: {
        totalRevenue,
        totalAdminCommission,
        totalMentorEarnings
      },
      transactions: results
    });
  });
});

// ========================= VERIFY MENTOR (ADMIN) =========================
app.post("/api/admin/verify-mentor", (req, res) => {
  const { mentorId, status } = req.body;
  db.query("UPDATE mentors SET verificationStatus = ? WHERE id = ?", [status, mentorId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: `Mentor ${status} successfully` });
  });
});

// ========================= GET MENTOR'S STUDENTS =========================
app.get("/api/mentor/:mentorId/students", (req, res) => {
  const { mentorId } = req.params;
  db.query("SELECT * FROM students WHERE mentorId = ? LIMIT 50", [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ students: results });
  });
});

// ========================= GET STUDENT DETAILS (FOR MENTOR) =========================
app.get("/api/mentor/:mentorId/student/:studentId", (req, res) => {
  const { mentorId, studentId } = req.params;
  
  db.query("SELECT * FROM students WHERE id = ?", [studentId], (err, studentResults) => {
    if (err) return res.status(500).json({ error: "Database error" });
    
    db.query("SELECT * FROM attendance WHERE studentId = ? AND mentorId = ? ORDER BY attendanceDate DESC LIMIT 30", [studentId, mentorId], (err, attendanceResults) => {
      if (err) return res.status(500).json({ error: "Database error" });
      
      db.query("SELECT * FROM studentPerformance WHERE studentId = ? AND mentorId = ? ORDER BY assessmentDate DESC LIMIT 10", [studentId, mentorId], (err, performanceResults) => {
        if (err) return res.status(500).json({ error: "Database error" });
        
        res.json({
          student: studentResults[0] || {},
          attendance: attendanceResults || [],
          performance: performanceResults || []
        });
      });
    });
  });
});

// ========================= GET MENTOR REVIEWS =========================
app.get("/api/mentor/:mentorId/reviews", (req, res) => {
  const { mentorId } = req.params;
  db.query("SELECT mr.*, s.fullName as studentName FROM mentorReviews mr LEFT JOIN students s ON mr.studentId = s.id WHERE mr.mentorId = ?", [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ reviews: results });
  });
});

// ========================= RECORD ATTENDANCE =========================
app.post("/api/mentor/record-attendance", (req, res) => {
  const { studentId, mentorId, attendanceDate, status, studyHours } = req.body;
  const query = "INSERT INTO attendance (studentId, mentorId, attendanceDate, status, studyHours, remarks) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?, studyHours = ?";
  
  db.query(query, [studentId, mentorId, attendanceDate, status, studyHours, 'Recorded', status, studyHours], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Attendance recorded successfully" });
  });
});

// ========================= ADD PERFORMANCE =========================
app.post("/api/mentor/add-performance", (req, res) => {
  const { studentId, mentorId, assessmentDate, conceptUnderstanding, practicalSkills, communication, punctuality, feedback } = req.body;
  const overallScore = ((parseFloat(conceptUnderstanding) + parseFloat(practicalSkills) + parseFloat(communication) + parseFloat(punctuality)) / 4).toFixed(2);
  
  const query = "INSERT INTO studentPerformance (studentId, mentorId, assessmentDate, conceptUnderstanding, practicalSkills, communication, punctuality, overallScore, feedback) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  
  db.query(query, [studentId, mentorId, assessmentDate, conceptUnderstanding, practicalSkills, communication, punctuality, overallScore, feedback], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Performance recorded successfully" });
  });
});

// ========================= GET STUDENT DASHBOARD =========================
app.get("/api/student/:studentId/dashboard", (req, res) => {
  const { studentId } = req.params;
  
  db.query("SELECT * FROM students WHERE id = ?", [studentId], (err, studentResults) => {
    if (err) return res.status(500).json({ error: "Database error" });
    
    db.query("SELECT COUNT(*) as total FROM attendance WHERE studentId = ? AND status = 'present'", [studentId], (err, presentResults) => {
      if (err) return res.status(500).json({ error: "Database error" });
      
      db.query("SELECT COUNT(*) as total FROM attendance WHERE studentId = ? AND status = 'absent'", [studentId], (err, absentResults) => {
        if (err) return res.status(500).json({ error: "Database error" });
        
        db.query("SELECT COUNT(*) as total FROM attendance WHERE studentId = ? AND status = 'late'", [studentId], (err, lateResults) => {
          if (err) return res.status(500).json({ error: "Database error" });
          
          db.query("SELECT AVG(overallScore) as avgScore FROM studentPerformance WHERE studentId = ?", [studentId], (err, avgResults) => {
            if (err) return res.status(500).json({ error: "Database error" });
            
            db.query("SELECT * FROM mentors WHERE id = (SELECT mentorId FROM students WHERE id = ?)", [studentId], (err, mentorResults) => {
              if (err) return res.status(500).json({ error: "Database error" });
              
              res.json({
                student: studentResults[0] || {},
                stats: {
                  present: presentResults[0].total || 0,
                  absent: absentResults[0].total || 0,
                  late: lateResults[0].total || 0,
                  avgScore: avgResults[0].avgScore || 0
                },
                mentor: mentorResults[0] || {}
              });
            });
          });
        });
      });
    });
  });
});

// ========================= GET STUDENT ATTENDANCE =========================
app.get("/api/student/:studentId/attendance", (req, res) => {
  const { studentId } = req.params;
  db.query("SELECT * FROM attendance WHERE studentId = ? ORDER BY attendanceDate DESC LIMIT 30", [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ attendance: results });
  });
});

// ========================= GET STUDENT PERFORMANCE =========================
app.get("/api/student/:studentId/performance", (req, res) => {
  const { studentId } = req.params;
  db.query("SELECT * FROM studentPerformance WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 10", [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ performance: results });
  });
});

// ========================= GET ADMIN DASHBOARD STATS (Without API prefix) =========================
app.get("/admin/dashboard", (req, res) => {
  console.log('📊 Fetching admin dashboard stats...');
  
  db.query("SELECT COUNT(*) as total FROM students", (err, studentResults) => {
    if (err) {
      console.error('❌ Error counting students:', err);
      return res.status(500).json({ error: "Database error" });
    }

    db.query("SELECT COUNT(*) as total FROM mentors", (err, mentorResults) => {
      if (err) {
        console.error('❌ Error counting mentors:', err);
        return res.status(500).json({ error: "Database error" });
      }

      db.query("SELECT COUNT(*) as total FROM courses", (err, courseResults) => {
        if (err) {
          console.error('❌ Error counting courses:', err);
          return res.status(500).json({ error: "Database error" });
        }

        db.query("SELECT COUNT(*) as total FROM attendance WHERE status = 'present'", (err, enrollmentResults) => {
          if (err) {
            console.error('❌ Error counting enrollments:', err);
            return res.status(500).json({ error: "Database error" });
          }

          const dashboard = {
            totalStudents: studentResults[0].total || 0,
            totalMentors: mentorResults[0].total || 0,
            totalCourses: courseResults[0].total || 0,
            totalEnrollments: enrollmentResults[0].total || 0
          };

          console.log('✅ Dashboard stats ready:', dashboard);
          res.json({ dashboard });
        });
      });
    });
  });
});

// ========================= START SERVER =========================
const PORT = parseInt(process.env.PORT) || 5000;
const HOST = process.env.HOST || '127.0.0.1'; // Localhost

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT} (${process.env.NODE_ENV})`);
});
