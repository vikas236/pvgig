// backend/routes/referralRoutes.js
const express = require("express");
const {
  getAllReferrals,
  getReferralById,
  updateReferralStatus,
} = require("../controllers/referralController");
const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware"); // Import middleware

const router = express.Router();

// All referral routes will require authentication and admin authorization
router.use(authenticateToken);
router.use(authorizeAdmin);

router.get("/", getAllReferrals); // Get all referrals
router.get("/:id", getReferralById); // Get single referral by ID
router.put("/:id/status", updateReferralStatus); // Update referral status

module.exports = router;
