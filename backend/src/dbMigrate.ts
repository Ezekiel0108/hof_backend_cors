import mysql from 'mysql2/promise';
require('dotenv').config();

const poolMigrate = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || '',
  waitForConnections: true,
  connectionLimit: 1,
});

export default poolMigrate;