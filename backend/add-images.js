const mysql = require('mysql2');
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
  addMentorImages();
});

// Dummy avatar images in data URL format
const avatarImages = [
  // Blue avatar
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzNDQUIzRiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjYwIiByPSI0MCIgZmlsbD0iI2ZmZiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjE0MCIgcj0iNTAiIGZpbGw9IiNmZmYiIC8+PC9zdmc+',
  // Green avatar
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzI3QUU2MCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjYwIiByPSI0MCIgZmlsbD0iI2ZmZiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjE0MCIgcj0iNTAiIGZpbGw9IiNmZmYiIC8+PC9zdmc+',
  // Purple avatar
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzc2M0FENSI+PC9yZWN0PjxjaXJjbGUgY3g9IjEwMCIgY3k9IjYwIiByPSI0MCIgZmlsbD0iI2ZmZiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjE0MCIgcj0iNTAiIGZpbGw9IiNmZmYiIC8+PC9zdmc+',
  // Orange avatar
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0Y1OUUwQiI+PC9yZWN0PjxjaXJjbGUgY3g9IjEwMCIgY3k9IjYwIiByPSI0MCIgZmlsbD0iI2ZmZiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjE0MCIgcj0iNTAiIGZpbGw9IiNmZmYiIC8+PC9zdmc+',
  // Red avatar
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0U3NEMzQyI+PC9yZWN0PjxjaXJjbGUgY3g9IjEwMCIgY3k9IjYwIiByPSI0MCIgZmlsbD0iI2ZmZiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjE0MCIgcj0iNTAiIGZpbGw9IiNmZmYiIC8+PC9zdmc+',
];

async function addMentorImages() {
  try {
    console.log('🎨 Adding profile images to mentors...');

    // Get all mentors
    const mentors = await new Promise((resolve, reject) => {
      db.query('SELECT id FROM mentors', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log(`Found ${mentors.length} mentors`);

    // Update each mentor with an image
    for (let i = 0; i < mentors.length; i++) {
      const mentorId = mentors[i].id;
      const imageIndex = i % avatarImages.length;
      const image = avatarImages[imageIndex];

      await new Promise((resolve, reject) => {
        db.query('UPDATE mentors SET profileImage = ? WHERE id = ?', [image, mentorId], (err) => {
          if (err) {
            console.log(`⚠️ Error updating mentor ${mentorId}:`, err.message);
          } else {
            console.log(`✅ Updated mentor ${mentorId} with image`);
          }
          resolve();
        });
      });
    }

    // Add images to students as well
    console.log('\n🎨 Adding profile images to students...');
    
    const students = await new Promise((resolve, reject) => {
      db.query('SELECT id FROM students', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log(`Found ${students.length} students`);

    for (let i = 0; i < students.length; i++) {
      const studentId = students[i].id;
      const imageIndex = i % avatarImages.length;
      const image = avatarImages[imageIndex];

      await new Promise((resolve, reject) => {
        db.query('UPDATE students SET profileImage = ? WHERE id = ?', [image, studentId], (err) => {
          if (err) {
            console.log(`⚠️ Error updating student ${studentId}:`, err.message);
          }
          resolve();
        });
      });
    }

    console.log('✅ All profile images added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}
