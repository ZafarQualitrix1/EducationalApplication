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

  const sql = "UPDATE mentors SET email = 'dr.rajesh.kumar@mentor.com' WHERE email = 'dr..rajesh.kumar@mentor.com'";
  db.query(sql, (err, res) => {
    if (err) {
      console.error('UPDATE ERR', err.message);
    } else {
      console.log('UPDATE OK', res.affectedRows);
    }
    db.end();
  });
});
