const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.development') });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// Connect and setup
db.connect(async (err) => {
  if (err) {
    console.error('❌ Connection failed:', err);
    return;
  }
  
  console.log('✅ Connected to MySQL');
  
  // Create database
  db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err) => {
    if (err) {
      console.error('❌ Database creation failed:', err);
      db.end();
      return;
    }
    
    console.log('✅ Database created/exists');
    
    // Switch to database
    db.changeUser({ database: process.env.DB_NAME }, (err) => {
      if (err) {
        console.error('❌ Database switch failed:', err);
        db.end();
        return;
      }
      
      createTables();
    });
  });
  
  async function createTables() {
    // Drop existing tables (for fresh setup)
    const dropSequence = [
      'DROP TABLE IF EXISTS videos',
      'DROP TABLE IF EXISTS enrollments',
      'DROP TABLE IF EXISTS courses',
      'DROP TABLE IF EXISTS mentors',
      'DROP TABLE IF EXISTS students',
      'DROP TABLE IF EXISTS admins'
    ];
    
    let dropCount = 0;
    
    dropSequence.forEach((query) => {
      db.query(query, (err) => {
        if (err) console.error('❌ Drop failed:', err);
        dropCount++;
        
        if (dropCount === dropSequence.length) {
          createStudentsTable();
        }
      });
    });
    
    function createStudentsTable() {
      const studentTable = `
        CREATE TABLE students (
          id INT PRIMARY KEY AUTO_INCREMENT,
          prn VARCHAR(50) UNIQUE,
          fullName VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          mobile VARCHAR(15),
          dob DATE,
          gender VARCHAR(10),
          address TEXT,
          city VARCHAR(100),
          state VARCHAR(100),
          pinCode VARCHAR(10),
          profileImage LONGTEXT,
          dailyStudyMinutes INT DEFAULT 0,
          ranking INT DEFAULT 0,
          enrolledCourses JSON,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      db.query(studentTable, (err) => {
        if (err) {
          console.error('❌ Students table creation failed:', err);
          db.end();
          return;
        }
        console.log('✅ Students table created');
        createMentorsTable();
      });
    }
    
    function createMentorsTable() {
      const mentorTable = `
        CREATE TABLE mentors (
          id INT PRIMARY KEY AUTO_INCREMENT,
          fullName VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          specialization VARCHAR(255),
          bio TEXT,
          profileImage LONGTEXT,
          mobile VARCHAR(15),
          experience INT,
          rating DECIMAL(3,2),
          students_count INT DEFAULT 0,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      db.query(mentorTable, (err) => {
        if (err) {
          console.error('❌ Mentors table creation failed:', err);
          db.end();
          return;
        }
        console.log('✅ Mentors table created');
        createCoursesTable();
      });
    }
    
    function createCoursesTable() {
      const coursesTable = `
        CREATE TABLE courses (
          id INT PRIMARY KEY AUTO_INCREMENT,
          courseName VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          duration VARCHAR(50),
          level VARCHAR(50),
          description TEXT,
          instructor VARCHAR(255),
          price DECIMAL(10,2),
          rating DECIMAL(3,2),
          students_enrolled INT DEFAULT 0,
          coverImage LONGTEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      db.query(coursesTable, (err) => {
        if (err) {
          console.error('❌ Courses table creation failed:', err);
          db.end();
          return;
        }
        console.log('✅ Courses table created');
        createEnrollmentsTable();
      });
    }
    
    function createEnrollmentsTable() {
      const enrollmentsTable = `
        CREATE TABLE enrollments (
          id INT PRIMARY KEY AUTO_INCREMENT,
          student_id INT NOT NULL,
          course_id INT NOT NULL,
          enrolledDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          progress INT DEFAULT 0,
          completionDate DATETIME,
          status VARCHAR(50) DEFAULT 'ongoing',
          FOREIGN KEY (student_id) REFERENCES students(id),
          FOREIGN KEY (course_id) REFERENCES courses(id)
        )
      `;
      
      db.query(enrollmentsTable, (err) => {
        if (err) {
          console.error('❌ Enrollments table creation failed:', err);
          db.end();
          return;
        }
        console.log('✅ Enrollments table created');
        createVideosTable();
      });
    }
    
    function createVideosTable() {
      const videosTable = `
        CREATE TABLE videos (
          id INT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(255) NOT NULL,
          course_id INT,
          url VARCHAR(500),
          thumbnail TEXT,
          duration VARCHAR(20),
          views INT DEFAULT 0,
          category VARCHAR(100),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (course_id) REFERENCES courses(id)
        )
      `;
      
      db.query(videosTable, (err) => {
        if (err) {
          console.error('❌ Videos table creation failed:', err);
          db.end();
          return;
        }
        console.log('✅ Videos table created');
        createAdminsTable();
      });
    }
    
    function createAdminsTable() {
      const adminsTable = `
        CREATE TABLE admins (
          id INT PRIMARY KEY AUTO_INCREMENT,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      db.query(adminsTable, (err) => {
        if (err) {
          console.error('❌ Admins table creation failed:', err);
          db.end();
          return;
        }
        console.log('✅ Admins table created');
        insertDummyData();
      });
    }
  }
  
  async function insertDummyData() {
    console.log('\n📊 Inserting dummy data...\n');
    
    // Create admin credentials
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminQuery = `INSERT INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)`;
    
    db.query(adminQuery, ['admin', 'admin@codewarrior.com', adminPassword, 'super_admin'], (err) => {
      if (err) console.error('❌ Admin insertion failed:', err);
      else console.log('✅ Admin account created (username: admin, password: admin123)');
      
      insertCourses();
    });
    
    async function insertCourses() {
      const courses = [
        // QA Automation courses
        { name: 'Java for QA Automation', category: 'QA Automation', duration: '8 weeks', level: 'Beginner', price: 99.99, students: 156 },
        { name: 'Python for QA Automation', category: 'QA Automation', duration: '8 weeks', level: 'Beginner', price: 99.99, students: 142 },
        { name: 'Selenium WebDriver with Java', category: 'QA Automation', duration: '10 weeks', level: 'Intermediate', price: 149.99, students: 128 },
        { name: 'API Automation with RestAssured', category: 'QA Automation', duration: '8 weeks', level: 'Intermediate', price: 129.99, students: 95 },
        { name: 'Mobile Automation with Appium', category: 'QA Automation', duration: '10 weeks', level: 'Advanced', price: 179.99, students: 67 },
        { name: 'Selenium with Python', category: 'QA Automation', duration: '9 weeks', level: 'Intermediate', price: 139.99, students: 103 },
        { name: 'API Testing Fundamentals', category: 'QA Automation', duration: '6 weeks', level: 'Beginner', price: 79.99, students: 187 },
        { name: 'Advanced Mobile Automation', category: 'QA Automation', duration: '12 weeks', level: 'Advanced', price: 199.99, students: 45 },
        // Existing courses
        { name: 'Web Development', category: 'Development', duration: '12 weeks', level: 'Beginner', price: 199.99, students: 1250 },
        { name: 'Data Science', category: 'Data', duration: '16 weeks', level: 'Intermediate', price: 249.99, students: 980 },
        { name: 'Mobile Development', category: 'Development', duration: '10 weeks', level: 'Intermediate', price: 199.99, students: 850 },
        { name: 'AI & Machine Learning', category: 'Data', duration: '14 weeks', level: 'Advanced', price: 299.99, students: 750 },
        { name: 'Cloud Computing', category: 'Infrastructure', duration: '8 weeks', level: 'Intermediate', price: 179.99, students: 620 },
        { name: 'Cybersecurity', category: 'Security', duration: '12 weeks', level: 'Advanced', price: 249.99, students: 540 }
      ];
      
      let courseCount = 0;
      
      courses.forEach((course) => {
        const courseQuery = `INSERT INTO courses (courseName, category, duration, level, description, instructor, price, rating, students_enrolled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const description = `Learn ${course.name} from industry experts. This comprehensive course covers all fundamentals and advanced concepts.`;
        
        db.query(courseQuery, [
          course.name,
          course.category,
          course.duration,
          course.level,
          description,
          'Expert Instructors',
          course.price,
          (4.5 + Math.random()).toFixed(1),
          course.students
        ], (err) => {
          if (err) console.error(`❌ Course insertion failed for ${course.name}:`, err);
          else console.log(`✅ Course added: ${course.name}`);
          
          courseCount++;
          if (courseCount === courses.length) {
            insertMentors();
          }
        });
      });
    }
    
    async function insertMentors() {
      const mentorsData = [
        { name: 'Dr. Rajesh Kumar', spec: 'Java & QA Automation', bio: '15+ years in QA automation', exp: 15, rating: 4.9 },
        { name: 'Priya Sharma', spec: 'Python & Selenium', bio: 'Expert in web and mobile automation', exp: 12, rating: 4.8 },
        { name: 'Amit Singh', spec: 'API Automation', bio: 'RestAssured and API testing specialist', exp: 10, rating: 4.7 },
        { name: 'Neha Patel', spec: 'Mobile Automation', bio: 'Appium and mobile testing expert', exp: 8, rating: 4.6 },
        { name: 'Vikram Reddy', spec: 'Web Development', bio: 'Full-stack developer and educator', exp: 14, rating: 4.9 },
        { name: 'Sarah Johnson', spec: 'Data Science', bio: 'ML and data analytics specialist', exp: 11, rating: 4.8 },
        { name: 'James Wilson', spec: 'Cloud Computing', bio: 'AWS and Cloud infrastructure expert', exp: 9, rating: 4.7 },
        { name: 'Divya Sharma', spec: 'Cybersecurity', bio: 'Network security and ethical hacking', exp: 13, rating: 4.9 },
        { name: 'Rohan Kapoor', spec: 'Mobile Development', bio: 'Native and cross-platform mobile dev', exp: 10, rating: 4.8 },
        { name: 'Emma Davis', spec: 'DevOps & CI/CD', bio: 'Container and orchestration expert', exp: 8, rating: 4.7 },
        { name: 'Karthik Babu', spec: 'AI & ML', bio: 'Deep learning and neural networks', exp: 12, rating: 4.9 },
        { name: 'Lisa Anderson', spec: 'Database Design', bio: 'SQL and NoSQL expert', exp: 11, rating: 4.8 },
        { name: 'Arjun Nair', spec: 'JavaScript & React', bio: 'Frontend specialist', exp: 9, rating: 4.7 },
        { name: 'Shreya Gupta', spec: 'QA & Testing', bio: 'Manual and automation testing', exp: 10, rating: 4.8 },
        { name: 'Michael Chen', spec: 'System Design', bio: 'Scalable system architecture', exp: 14, rating: 4.9 },
        { name: 'Anjali Verma', spec: 'Java & Spring', bio: 'Enterprise Java specialist', exp: 13, rating: 4.8 },
        { name: 'David Martinez', spec: 'Python & Django', bio: 'Full-stack Python developer', exp: 11, rating: 4.7 },
        { name: 'Riya Chakraborty', spec: 'UI/UX Design', bio: 'Design and user experience expert', exp: 9, rating: 4.8 },
        { name: 'Carlos Rodriguez', spec: 'Microservices', bio: 'Microservices architecture expert', exp: 12, rating: 4.9 },
        { name: 'Maya Singh', spec: 'Web Performance', bio: 'Performance optimization specialist', exp: 10, rating: 4.7 }
      ];
      
      let mentorCount = 0;
      
      mentorsData.forEach(async (mentor) => {
        const password = await bcrypt.hash('mentor123', 10);
        const email = mentor.name.toLowerCase().replace(/\s+/g, '.') + '@mentor.com';
        
        const mentorQuery = `INSERT INTO mentors (fullName, email, password, specialization, bio, mobile, experience, rating, students_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.query(mentorQuery, [
          mentor.name,
          email,
          password,
          mentor.spec,
          mentor.bio,
          '+91-' + Math.floor(Math.random() * 9000000000 + 1000000000),
          mentor.exp,
          mentor.rating,
          Math.floor(Math.random() * 200 + 50)
        ], (err) => {
          if (err) console.error(`❌ Mentor insertion failed for ${mentor.name}:`, err);
          else console.log(`✅ Mentor added: ${mentor.name}`);
          
          mentorCount++;
          if (mentorCount === mentorsData.length) {
            insertStudents();
          }
        });
      });
    }
    
    async function insertStudents() {
      const firstNames = ['Raj', 'Priya', 'Amit', 'Neha', 'Vikram', 'Sarah', 'James', 'Divya', 'Rohan', 'Emma', 'Karthik', 'Lisa', 'Arjun', 'Shreya', 'Michael', 'Anjali', 'David', 'Riya', 'Carlos', 'Maya', 'Aisha', 'Ravi', 'Sneha', 'Varun', 'Pooja', 'Nikhil', 'Isha', 'Sanjay', 'Meera', 'Deepak', 'Zara', 'Harsh', 'Swati', 'Akshay', 'Bhavna', 'Chirag', 'Diya', 'Eachit', 'Farhan', 'Geeta', 'Harika', 'Imran', 'Jaya', 'Karan', 'Leela', 'Manan', 'Nina', 'Ojas', 'Prashant'];
      const lastNames = ['Kumar', 'Sharma', 'Singh', 'Patel', 'Reddy', 'Johnson', 'Wilson', 'Kapoor', 'Davis', 'Babu', 'Anderson', 'Nair', 'Gupta', 'Chen', 'Verma', 'Martinez', 'Rodriguez', 'Chakraborty', 'Khose', 'Desai', 'Malhotra', 'Joshi', 'Rao', 'Iyer', 'Nayar'];
      const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];
      
      let studentCount = 0;
      
      for (let i = 1; i <= 50; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = firstName + ' ' + lastName;
        const email = firstName.toLowerCase() + i + '@student.com';
        const password = await bcrypt.hash('student123', 10);
        const mobile = '91' + Math.floor(Math.random() * 9000000000 + 1000000000);
        const city = cities[Math.floor(Math.random() * cities.length)];
        
        const studentQuery = `INSERT INTO students (prn, fullName, email, password, mobile, dob, gender, address, city, state, pinCode, dailyStudyMinutes, ranking, enrolledCourses) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const prn = 'PRN' + String(1000 + i).padStart(5, '0');
        const gender = Math.random() > 0.5 ? 'Male' : 'Female';
        const dob = new Date(1990 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
        
        db.query(studentQuery, [
          prn,
          fullName,
          email,
          password,
          mobile,
          dob,
          gender,
          '123 Street, ' + city,
          city,
          'India',
          '400' + String(Math.floor(Math.random() * 100)).padStart(3, '0'),
          Math.floor(Math.random() * 300 + 30),
          Math.floor(Math.random() * 100),
          JSON.stringify([])
        ], (err) => {
          if (err) console.error(`❌ Student insertion failed:`, err);
          else console.log(`✅ Student added: ${i}/50`);
          
          studentCount++;
          if (studentCount === 50) {
            insertVideos();
          }
        });
      }
    }
    
    async function insertVideos() {
      const videos = [
        { title: 'Java Basics for QA Automation', course: 'Java for QA Automation', duration: '42:15', views: 5420, category: 'Tutorial' },
        { title: 'Setting up Selenium Environment', course: 'Selenium WebDriver with Java', duration: '28:30', views: 4230, category: 'Setup' },
        { title: 'Python Essential Concepts', course: 'Python for QA Automation', duration: '55:12', views: 6120, category: 'Tutorial' },
        { title: 'RestAssured API Testing', course: 'API Automation with RestAssured', duration: '38:45', views: 3890, category: 'Tutorial' },
        { title: 'Appium Installation Guide', course: 'Mobile Automation with Appium', duration: '22:18', views: 2450, category: 'Setup' },
        { title: 'Web Development Fundamentals', course: 'Web Development', duration: '45:30', views: 8920, category: 'Tutorial' },
        { title: 'Data Science with Python', course: 'Data Science', duration: '52:15', views: 7650, category: 'Tutorial' },
        { title: 'Machine Learning Algorithms', course: 'AI & Machine Learning', duration: '68:45', views: 5340, category: 'Tutorial' },
        { title: 'Cloud Computing Basics', course: 'Cloud Computing', duration: '35:20', views: 4120, category: 'Tutorial' },
        { title: 'Cybersecurity Fundamentals', course: 'Cybersecurity', duration: '48:50', views: 3980, category: 'Tutorial' },
        { title: 'Advanced Selenium Techniques', course: 'Selenium WebDriver with Java', duration: '52:30', views: 2890, category: 'Advanced' },
        { title: 'Mobile Automation Best Practices', course: 'Mobile Automation with Appium', duration: '44:15', views: 1980, category: 'Best Practices' }
      ];
      
      let videoCount = 0;
      
      videos.forEach((video) => {
        const videoQuery = `INSERT INTO videos (title, url, thumbnail, duration, views, category) VALUES (?, ?, ?, ?, ?, ?)`;
        
        db.query(videoQuery, [
          video.title,
          'https://example.com/videos/' + video.title.replace(/\s+/g, '-').toLowerCase(),
          '🎥',
          video.duration,
          video.views,
          video.category
        ], (err) => {
          if (err) console.error(`❌ Video insertion failed:`, err);
          else console.log(`✅ Video added: ${video.title}`);
          
          videoCount++;
          if (videoCount === videos.length) {
            console.log('\n✅ ✅ ✅ DATABASE SETUP COMPLETE! ✅ ✅ ✅');
            console.log('\n📊 DUMMY DATA SUMMARY:');
            console.log('   • 50 Students created');
            console.log('   • 20 Mentors created');
            console.log('   • 14 Courses created (8 QA Automation courses)');
            console.log('   • 12 Videos created');
            console.log('   • 1 Admin account created\n');
            console.log('👤 ADMIN CREDENTIALS:');
            console.log('   • Username: admin');
            console.log('   • Email: admin@codewarrior.com');
            console.log('   • Password: admin123\n');
            console.log('👨‍🎓 SAMPLE STUDENT LOGIN:');
            console.log('   • Email: raj1@student.com');
            console.log('   • Password: student123\n');
            console.log('👨‍🏫 SAMPLE MENTOR LOGIN:');
            console.log('   • Email: dr.rajesh.kumar@mentor.com');
            console.log('   • Password: mentor123\n');
            db.end();
          }
        });
      });
    }
  }
});
