const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, `.env.${process.env.NODE_ENV || 'development'}`) });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

db.connect(err => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database');
  setupDatabase();
});

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database tables...');

    // 1. ALTER STUDENTS TABLE - HANDLE EACH COLUMN SEPARATELY
    console.log('📝 Updating students table columns...');
    
    try {
      await executeQuery(`ALTER TABLE students ADD COLUMN profileImage LONGTEXT DEFAULT NULL`);
    } catch (e) {}
    
    try {
      await executeQuery(`ALTER TABLE students ADD COLUMN dailyStudyMinutes INT DEFAULT 0`);
    } catch (e) {}
    
    try {
      await executeQuery(`ALTER TABLE students ADD COLUMN ranking INT DEFAULT 0`);
    } catch (e) {}
    
    try {
      await executeQuery(`ALTER TABLE students ADD COLUMN mentorId INT DEFAULT NULL`);
    } catch (e) {}
    
    try {
      await executeQuery(`ALTER TABLE students ADD COLUMN status ENUM('active', 'inactive', 'suspended') DEFAULT 'active'`);
    } catch (e) {}

    console.log('✅ Students table updated');

    // 2. CREATE MENTORS TABLE
    const createMentors = `
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
        verificationStatus ENUM('pending', 'verified', 'rejected') DEFAULT 'verified',
        totalStudents INT DEFAULT 0,
        averageRating DECIMAL(3, 2) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active'
      )
    `;

    // 3. CREATE ATTENDANCE TABLE
    const createAttendance = `
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
      )
    `;

    // 4. CREATE MENTOR REVIEWS TABLE
    const createMentorReviews = `
      CREATE TABLE IF NOT EXISTS mentorReviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mentorId INT NOT NULL,
        studentId INT NOT NULL,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        reviewDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mentorId) REFERENCES mentors(id) ON DELETE CASCADE,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
      )
    `;

    // 5. CREATE STUDENT PERFORMANCE TABLE
    const createStudentPerformance = `
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
      )
    `;

    // 6. CREATE COURSES TABLE
    const createCourses = `
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mentorId INT NOT NULL,
        courseName VARCHAR(255) NOT NULL,
        courseDescription TEXT,
        duration INT DEFAULT 0,
        studentsEnrolled INT DEFAULT 0,
        startDate DATE,
        endDate DATE,
        coursePrice DECIMAL(10, 2) DEFAULT 0,
        totalRevenue DECIMAL(10, 2) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mentorId) REFERENCES mentors(id) ON DELETE CASCADE
      )
    `;

    // 7. CREATE FINANCIAL TRACKING TABLE
    const createFinancial = `
      CREATE TABLE IF NOT EXISTS financialTracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
      )
    `;

    // 8. CREATE ADMINS TABLE
    const createAdmins = `
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fullName VARCHAR(255),
        role ENUM('super_admin', 'admin') DEFAULT 'admin',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 9. CREATE ASSIGNMENTS TABLE
    const createAssignments = `
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
      )
    `;

    // Execute table creations
    const tables = [
      { name: 'Mentors', query: createMentors },
      { name: 'Attendance', query: createAttendance },
      { name: 'Mentor Reviews', query: createMentorReviews },
      { name: 'Student Performance', query: createStudentPerformance },
      { name: 'Courses', query: createCourses },
      { name: 'Financial Tracking', query: createFinancial },
      { name: 'Admins', query: createAdmins },
      { name: 'Assignments', query: createAssignments }
    ];

    for (let table of tables) {
      await executeQuery(table.query);
      console.log(`✅ ${table.name} table ready`);
    }

    // Insert dummy data
    await insertDummyData();

    console.log('✅ Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup error:', error);
    process.exit(1);
  }
}

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    db.query(query, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function insertDummyData() {
  console.log('\n📊 Inserting dummy data...');

  // 1. Insert mentors (20 mentors)
  const mentorData = [
    ['rajesh_mentor', 'rajesh@mentor.com', 'Rajesh Kumar', 'Web Development', 'Mumbai', 'Maharashtra', 8],
    ['priya_mentor', 'priya@mentor.com', 'Priya Sharma', 'Data Science', 'Bangalore', 'Karnataka', 6],
    ['amit_mentor', 'amit@mentor.com', 'Amit Patel', 'Mobile Development', 'Delhi', 'Delhi', 5],
    ['sneha_mentor', 'sneha@mentor.com', 'Sneha Gupta', 'Cloud Computing', 'Hyderabad', 'Telangana', 7],
    ['vikram_mentor', 'vikram@mentor.com', 'Vikram Singh', 'AI/ML', 'Pune', 'Maharashtra', 9],
    ['arjun_mentor', 'arjun@mentor.com', 'Arjun Verma', 'Python Programming', 'Chennai', 'Tamil Nadu', 6],
    ['meera_mentor', 'meera@mentor.com', 'Meera Iyer', 'Java Development', 'Kolkata', 'West Bengal', 7],
    ['karthik_mentor', 'karthik@mentor.com', 'Karthik Reddy', 'DevOps', 'Bangalore', 'Karnataka', 5],
    ['simran_mentor', 'simran@mentor.com', 'Simran Kaur', 'Frontend Development', 'Delhi', 'Delhi', 4],
    ['arun_mentor', 'arun@mentor.com', 'Arun Kumar', 'Backend Development', 'Mumbai', 'Maharashtra', 8],
    ['pooja_mentor', 'pooja@mentor.com', 'Pooja Singh', 'Machine Learning', 'Bangalore', 'Karnataka', 6],
    ['rahul_mentor', 'rahul@mentor.com', 'Rahul Bhatt', 'Cyber Security', 'Pune', 'Maharashtra', 7],
    ['deepa_mentor', 'deepa@mentor.com', 'Deepa Rao', 'Database Design', 'Hyderabad', 'Telangana', 5],
    ['nitin_mentor', 'nitin@mentor.com', 'Nitin Verma', 'UI/UX Design', 'Mumbai', 'Maharashtra', 4],
    ['priya_s_mentor', 'priya.s@mentor.com', 'Priya S', 'QA Testing', 'Bangalore', 'Karnataka', 5],
    ['sandeep_mentor', 'sandeep@mentor.com', 'Sandeep Kumar', 'System Design', 'Delhi', 'Delhi', 9],
    ['neha_mentor', 'neha@mentor.com', 'Neha Joshi', 'Graphic Design', 'Pune', 'Maharashtra', 3],
    ['harsh_mentor', 'harsh@mentor.com', 'Harsh Verma', 'React Development', 'Bangalore', 'Karnataka', 5],
    ['anita_mentor', 'anita@mentor.com', 'Anita Gupta', 'Technical Writing', 'Hyderabad', 'Telangana', 6],
    ['ravi_mentor', 'ravi@mentor.com', 'Ravi Shankar', 'Software Architecture', 'Chennai', 'Tamil Nadu', 10]
  ];

  const hashedPassword = await bcrypt.hash('password123', 10);
  const mentorIds = [];

  for (let mentor of mentorData) {
    const query = `INSERT IGNORE INTO mentors (username, email, password, fullName, specialization, city, state, yearsOfExperience, verificationStatus, totalStudents, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'verified', 10, 'active')`;
    
    await new Promise((resolve, reject) => {
      db.query(query, [mentor[0], mentor[1], hashedPassword, mentor[2], mentor[3], mentor[4], mentor[5], mentor[6]], (err, result) => {
        if (err) {
          console.log('⚠️ Mentor might already exist:', mentor[0]);
          mentorIds.push(mentorIds.length + 1);
          resolve();
        } else if (result && result.insertId) {
          mentorIds.push(result.insertId);
          resolve();
        } else {
          mentorIds.push(mentorIds.length + 1);
          resolve();
        }
      });
    });
  }

  console.log(`✅ Inserted ${mentorData.length} mentors`);

  // 2. Insert students (50 students)
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Kolkata', 'Chennai', 'Jaipur'];
  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Maharashtra', 'West Bengal', 'Tamil Nadu', 'Rajasthan'];
  const studentNames = [
    'Aarav Sharma', 'Vivaan Kumar', 'Aditya Singh', 'Arjun Patel', 'Dhruv Gupta',
    'Karan Verma', 'Nikhil Bhat', 'Rohan Desai', 'Saurav Nair', 'Tanvi Kapoor',
    'Ananya Mishra', 'Divya Rao', 'Geeta Sen', 'Hema Pillai', 'Isha Reddy',
    'Jiya Sinha', 'Kavya Menon', 'Lakshmi Kumar', 'Meera Singh', 'Neha Saxena',
    'Pari Joshi', 'Qamra Khan', 'Riya Gupta', 'Samara Ahmed', 'Tanu Verma',
    'Usha Nair', 'Veda Sharma', 'Witika Sinha', 'Xenia Roy', 'Yara Khan',
    'Ziana Patel', 'Aryan Verma', 'Bhavna Singh', 'Chirag Bhat', 'Diya Nair',
    'Eshan Kumar', 'Farhan Malik', 'Gita Rao', 'Harsh Gupta', 'Ishan Sharma',
    'Jatin Kumar', 'Karan Singh', 'Laxmi Verma', 'Manish Patel', 'Naarav Joshi',
    'Omi Rao', 'Palak Sharma', 'Quirk Singh', 'Raj Verma', 'Siya Kumar'
  ];

  const studentEmails = studentNames.map((name, i) => `student${i+1}@email.com`);

  for (let i = 0; i < 50; i++) {
    const query = `INSERT IGNORE INTO students (fullName, email, mobile, dob, gender, address, city, state, pinCode, password, dailyStudyMinutes, ranking, mentorId, status) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`;
    
    const dob = `${1999 + Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
    const mobile = `98${String(Math.floor(Math.random() * 10000000)).padStart(8, '0')}`;
    const cityIdx = i % cities.length;
    const mentorIdx = i % mentorIds.length;

    await new Promise((resolve, reject) => {
      db.query(query, [
        studentNames[i],
        studentEmails[i],
        mobile,
        dob,
        Math.random() > 0.5 ? 'Male' : 'Female',
        `${i+1}, Street ${i+1}`,
        cities[cityIdx],
        states[cityIdx],
        `${String(100000 + i).padStart(6, '0')}`,
        hashedPassword,
        Math.floor(Math.random() * 200),
        Math.floor(Math.random() * 100),
        mentorIds[mentorIdx],
      ], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  console.log('✅ Inserted 50 students');

  // 3. Insert attendance records
  const today = new Date();
  for (let i = 1; i <= 50; i++) {
    for (let m = 0; m < mentorIds.length; m++) {
      for (let d = 0; d < 15; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - d);
        const dateStr = date.toISOString().split('T')[0];
        
        const query = `INSERT IGNORE INTO attendance (studentId, mentorId, attendanceDate, status, studyHours, remarks) VALUES (?, ?, ?, ?, ?, ?)`;
        const statuses = ['present', 'absent', 'late'];
        const status = statuses[Math.floor(Math.random() * 3)];
        
        await new Promise((resolve) => {
          db.query(query, [i, mentorIds[m], dateStr, status, Math.random() * 4 + 1, 'Regular session'], (err) => {
            resolve();
          });
        });
      }
    }
  }

  console.log('✅ Inserted attendance records');

  // 4. Insert mentor reviews
  for (let m = 0; m < mentorIds.length; m++) {
    for (let i = 1; i <= 8; i++) {
      const query = `INSERT IGNORE INTO mentorReviews (mentorId, studentId, rating, review) VALUES (?, ?, ?, ?)`;
      const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
      const reviews = [
        'Excellent mentor, very helpful',
        'Great teaching style',
        'Very knowledgeable and patient',
        'Highly recommended',
        'Amazing guidance'
      ];
      
      await new Promise((resolve) => {
        db.query(query, [mentorIds[m], i, rating, reviews[Math.floor(Math.random() * reviews.length)]], (err) => {
          resolve();
        });
      });
    }
  }

  console.log('✅ Inserted mentor reviews');

  // 5. Insert student performance
  for (let i = 1; i <= 50; i++) {
    for (let m = 0; m < mentorIds.length; m++) {
      for (let d = 0; d < 5; d++) {
        const date = new Date();
        date.setDate(date.getDate() - d * 30);
        const dateStr = date.toISOString().split('T')[0];
        
        const query = `INSERT IGNORE INTO studentPerformance (studentId, mentorId, assessmentDate, conceptUnderstanding, practicalSkills, communication, punctuality, overallScore, feedback) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const c = Math.floor(Math.random() * 30) + 70;
        const p = Math.floor(Math.random() * 30) + 70;
        const com = Math.floor(Math.random() * 30) + 70;
        const pun = Math.floor(Math.random() * 30) + 70;
        const avg = ((c + p + com + pun) / 4).toFixed(2);
        
        await new Promise((resolve) => {
          db.query(query, [i, mentorIds[m], dateStr, c, p, com, pun, avg, 'Good progress'], (err) => {
            resolve();
          });
        });
      }
    }
  }

  console.log('✅ Inserted student performance records');

  // 6. Insert courses
  const courseNames = [
    'Web Development Masterclass',
    'Advanced Python Programming',
    'React.js Complete Guide',
    'Data Science Fundamentals',
    'Cloud Architecture with AWS'
  ];

  for (let m = 0; m < mentorIds.length; m++) {
    const query = `INSERT INTO courses (mentorId, courseName, courseDescription, duration, studentsEnrolled, coursePrice, totalRevenue) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const studentCount = 15 + Math.floor(Math.random() * 20);
    const price = 5000 + Math.floor(Math.random() * 10000);
    const courseName = courseNames[m % courseNames.length];
    
    await new Promise((resolve) => {
      db.query(query, [mentorIds[m], courseName, `Comprehensive ${courseName}`, 30, studentCount, price, studentCount * price], (err) => {
        resolve();
      });
    });
  }

  console.log('✅ Inserted courses');

  // 7. Insert financial tracking
  for (let m = 0; m < mentorIds.length; m++) {
    for (let month = 0; month < 12; month++) {
      const date = new Date();
      date.setMonth(date.getMonth() - month);
      const monthStr = date.toISOString().split('T')[0].substring(0, 7) + '-01';
      
      const query = `INSERT INTO financialTracking (mentorId, courseId, totalEnrollments, totalRevenue, commissionPercentage, adminCommission, mentorEarnings, transactionMonth, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')`;
      
      const enrollments = 10 + Math.floor(Math.random() * 30);
      const price = 5000 + Math.floor(Math.random() * 10000);
      const revenue = enrollments * price;
      const adminComm = Math.round(revenue * 0.20);
      const mentorEarnings = revenue - adminComm;
      
      await new Promise((resolve) => {
        db.query(query, [mentorIds[m], (m % mentorIds.length) + 1, enrollments, revenue, 20, adminComm, mentorEarnings, monthStr], (err) => {
          resolve();
        });
      });
    }
  }

  console.log('✅ Inserted financial tracking');

  // 8. Insert default admin
  const adminQuery = `INSERT IGNORE INTO admins (username, email, password, fullName, role) VALUES (?, ?, ?, ?, ?)`;
  const adminHashedPassword = await bcrypt.hash('admin123', 10);

  await new Promise((resolve) => {
    db.query(adminQuery, ['admin', 'admin@system.com', adminHashedPassword, 'System Administrator', 'super_admin'], (err) => {
      resolve();
    });
  });

  console.log('✅ Inserted admin user');
}
