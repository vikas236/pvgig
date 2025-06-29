// backend/routes/authRoutes.js
const express = require('express');
const { adminLogin } = require('../controllers/authController');

const router = express.Router();

// Public route for admin login
router.post('/login', adminLogin);

module.exports = router;
