const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.development') });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) {
    console.log('Connection Failed:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to student_app database\n');
    
    db.query('DESCRIBE students;', (err, results) => {
      if (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
          console.log('ERROR: students table does not exist!');
          console.log('Creating students table...\n');
          
          const createTableSQL = `
            CREATE TABLE students (
              id INT AUTO_INCREMENT PRIMARY KEY,
              fullName VARCHAR(100) NOT NULL,
              email VARCHAR(100) UNIQUE NOT NULL,
              mobile VARCHAR(20),
              dob DATE,
              gender VARCHAR(10),
              address VARCHAR(255),
              city VARCHAR(50),
              state VARCHAR(50),
              pinCode VARCHAR(10),
              password VARCHAR(255) NOT NULL,
              profileImage LONGTEXT,
              dailyStudyMinutes INT DEFAULT 0,
              ranking INT DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;
          
          db.query(createTableSQL, (err2, result) => {
            if (err2) {
              console.log('Error creating table:', err2.message);
            } else {
              console.log('✅ Table created successfully!');
              console.log('Table structure:');
              console.log('  id - INT AUTO_INCREMENT PRIMARY KEY');
              console.log('  fullName - VARCHAR(100)');
              console.log('  email - VARCHAR(100) UNIQUE');
              console.log('  mobile - VARCHAR(20)');
              console.log('  dob - DATE');
              console.log('  gender - VARCHAR(10)');
              console.log('  address - VARCHAR(255)');
              console.log('  city - VARCHAR(50)');
              console.log('  state - VARCHAR(50)');
              console.log('  pinCode - VARCHAR(10)');
              console.log('  password - VARCHAR(255)');
              console.log('  profileImage - LONGTEXT');
              console.log('  dailyStudyMinutes - INT');
              console.log('  ranking - INT');
              console.log('  created_at - TIMESTAMP');
            }
            db.end();
          });
        } else {
          console.log('Error:', err.message);
          db.end();
        }
      } else {
        console.log('✅ students table exists with columns:');
        results.forEach(col => {
          console.log(`  ${col.Field} - ${col.Type}`);
        });
        db.end();
      }
    });
  }
});
