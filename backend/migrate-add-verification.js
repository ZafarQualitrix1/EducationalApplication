const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.development') });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

db.connect(err => {
  if (err) {
    console.error('CONN ERR', err.message);
    process.exit(1);
  }

  const sql = "ALTER TABLE mentors ADD COLUMN verificationStatus ENUM('pending','verified','rejected') DEFAULT 'verified'";
  db.query(sql, (err, res) => {
    if (err) {
      console.error('ALTER ERR', err.message);
    } else {
      console.log('ALTER OK');
    }
    db.end();
  });
});
