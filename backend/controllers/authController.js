// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Your database connection pool

// For hashing passwords (e.g., if you were to create an admin user manually)
const saltRounds = 10; // Standard for bcrypt

// Function to hash a password (useful for manually inserting an admin user into the DB)
async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log("Hashed password:", hashedPassword);
        return hashedPassword;
    } catch (err) {
        console.error("Error hashing password:", err);
        throw new Error("Password hashing failed.");
    }
}

// Admin Login Logic
async function adminLogin(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // 1. Find the user by username in the database
        const result = await pool.query('SELECT user_id, username, password_hash, role FROM anvi_users WHERE username = $1 AND role = \'admin\'', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials or not an admin user.' });
        }

        const user = result.rows[0];

        // 2. Compare the provided password with the hashed password from the database
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 3. If credentials match, generate a JWT
        // NEVER include sensitive info like password_hash in the token payload
        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // 4. Send the token back to the client
        res.status(200).json({ message: 'Login successful!', token, user: { id: user.user_id, username: user.username, role: user.role } });

    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
}

module.exports = {
    adminLogin,
    hashPassword // Export this for manual use/testing if needed
};
