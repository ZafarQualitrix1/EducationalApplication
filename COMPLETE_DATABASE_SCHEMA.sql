-- ====================================================================
-- COMPLETE DATABASE SCHEMA FOR STUDENT MANAGEMENT SYSTEM
-- ====================================================================

-- 1. ALTER EXISTING STUDENTS TABLE
ALTER TABLE students ADD COLUMN IF NOT EXISTS profileImage LONGTEXT DEFAULT NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS dailyStudyMinutes INT DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS ranking INT DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mentorId INT DEFAULT NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive', 'suspended') DEFAULT 'active';

-- 2. CREATE MENTORS TABLE
CREATE TABLE IF NOT EXISTS mentors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(255) NOT NULL,
  profileImage LONGTEXT DEFAULT NULL,
  specialization VARCHAR(255),
  phone VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  pinCode VARCHAR(10),
  yearsOfExperience INT DEFAULT 0,
  verificationStatus ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  totalStudents INT DEFAULT 0,
  averageRating DECIMAL(3, 2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active'
);

-- 3. CREATE ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  studentId INT NOT NULL,
  mentorId INT NOT NULL,
  attendanceDate DATE NOT NULL,
  status ENUM('present', 'absent', 'late') DEFAULT 'present',
  studyHours DECIMAL(3, 2) DEFAULT 0,
  remarks VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (mentorId) REFERENCES mentors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_attendance (studentId, mentorId, attendanceDate)
);

-- 4. CREATE MENTOR REVIEWS TABLE
CREATE TABLE IF NOT EXISTS mentorReviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mentorId INT NOT NULL,
  studentId INT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  reviewDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentorId) REFERENCES mentors(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);

-- 5. CREATE STUDENT PERFORMANCE TABLE
CREATE TABLE IF NOT EXISTS studentPerformance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  studentId INT NOT NULL,
  mentorId INT NOT NULL,
  assessmentDate DATE NOT NULL,
  conceptUnderstanding INT DEFAULT 0,
  practicalSkills INT DEFAULT 0,
  communication INT DEFAULT 0,
  punctuality INT DEFAULT 0,
  overallScore DECIMAL(3, 2) DEFAULT 0,
  feedback TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (mentorId) REFERENCES mentors(id) ON DELETE CASCADE
);

-- 6. CREATE COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mentorId INT NOT NULL,
  courseName VARCHAR(255) NOT NULL,
  courseDescription TEXT,
  duration INT DEFAULT 0,
  studentsEnrolled INT DEFAULT 0,
  startDate DATE,
  endDate DATE,
  totalRevenue DECIMAL(10, 2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentorId) REFERENCES mentors(id) ON DELETE CASCADE
);

-- 7. CREATE FINANCIAL TRACKING TABLE (FOR ADMIN)
CREATE TABLE IF NOT EXISTS financialTracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  adminId INT,
  mentorId INT,
  courseId INT,
  totalEnrollments INT DEFAULT 0,
  totalRevenue DECIMAL(10, 2) DEFAULT 0,
  commissionPercentage DECIMAL(5, 2) DEFAULT 20,
  adminCommission DECIMAL(10, 2) DEFAULT 0,
  mentorEarnings DECIMAL(10, 2) DEFAULT 0,
  transactionMonth DATE,
  status ENUM('pending', 'completed', 'pending_approval') DEFAULT 'pending_approval',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (mentorId) REFERENCES mentors(id) ON DELETE CASCADE
);

-- 8. CREATE ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(255),
  role ENUM('super_admin', 'admin') DEFAULT 'admin',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. CREATE ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mentorId INT NOT NULL,
  studentId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  dueDate DATE NOT NULL,
  status ENUM('assigned', 'submitted', 'graded', 'pending') DEFAULT 'assigned',
  submissionDate DATE,
  score INT,
  feedback TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentorId) REFERENCES mentors(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);

-- ====================================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ====================================================================

CREATE INDEX idx_mentor_email ON mentors(email);
CREATE INDEX idx_student_mentorId ON students(mentorId);
CREATE INDEX idx_attendance_date ON attendance(attendanceDate);
CREATE INDEX idx_attendance_student_mentor ON attendance(studentId, mentorId);
CREATE INDEX idx_performance_student_mentor ON studentPerformance(studentId, mentorId);
CREATE INDEX idx_course_mentor ON courses(mentorId);
CREATE INDEX idx_financial_mentor ON financialTracking(mentorId);
CREATE INDEX idx_financial_month ON financialTracking(transactionMonth);

-- ====================================================================
-- VERIFY TABLES
-- ====================================================================

SHOW TABLES;
DESCRIBE students;
DESCRIBE mentors;
DESCRIBE attendance;
DESCRIBE mentorReviews;
DESCRIBE studentPerformance;
DESCRIBE courses;
DESCRIBE financialTracking;
DESCRIBE assignments;
