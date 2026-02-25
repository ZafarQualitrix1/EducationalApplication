const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
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

async function run() {
  try {
    await new Promise((res, rej) => db.connect(err => err ? rej(err) : res()));
    const hashed = await bcrypt.hash('password123', 10);
    db.query("UPDATE mentors SET password = ? WHERE email = ?", [hashed, 'dr.rajesh.kumar@mentor.com'], (err, result) => {
      if (err) console.error('UPDATE ERR', err.message);
      else console.log('PASSWORD UPDATED', result.affectedRows);
      db.end();
    });
  } catch (e) {
    console.error('CONN ERR', e.message);
    process.exit(1);
  }
}

run();
