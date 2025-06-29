// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Ensure JWT_SECRET is loaded

function authenticateToken(req, res, next) {
  // Get token from header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer TOKEN"

  if (token == null) {
    return res.status(401).json({ message: "Authentication token required." });
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT verification error:", err);
      // Token is invalid or expired
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    // Attach user payload from token to the request
    req.user = user;
    next();
  });
}

// Optional: Middleware to check if the authenticated user is an admin
function authorizeAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next(); // User is an admin, proceed
  } else {
    res
      .status(403)
      .json({ message: "Access denied. Admin privileges required." });
  }
}

module.exports = {
  authenticateToken,
  authorizeAdmin,
};
