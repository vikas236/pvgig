// backend/routes/walletRoutes.js
const express = require("express");
const { adjustWalletBalance } = require("../controllers/walletController");
const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All wallet routes will require authentication and admin authorization
router.use(authenticateToken);
router.use(authorizeAdmin);

// Adjust balance for a specific user
router.post("/adjust/:userId", adjustWalletBalance);

module.exports = router;
