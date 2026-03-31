import mysql, { Pool } from 'mysql2';
require('dotenv').config();

const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;