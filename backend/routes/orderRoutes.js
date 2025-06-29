const express = require("express");
const {
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  createOrder,
  searchOrders, // Import the new searchOrders function
} = require("../controllers/orderController");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication and admin rights
router.use(authenticateToken);
router.use(authorizeAdmin);

// Routes
router.get("/", getAllOrders); // Get all orders (with optional filters)
router.get("/search", searchOrders); // New search endpoint
router.get("/:id", getOrderById); // Get a single order by ID
router.get("/user/:userId", getOrdersByUser); // Get orders by user ID
router.put("/:id/status", updateOrderStatus); // Update status of an order
router.post("/", createOrder); // Create a new order

module.exports = router;
