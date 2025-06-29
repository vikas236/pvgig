// backend/db.js
const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables from .env

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database!');
});

pool.on('error', (err) => {
    console.error('Error connecting to PostgreSQL:', err);
    process.exit(-1); // Exit process with failure
});

module.exports = pool;
