// backend/routes/customerRoutes.js
const express = require("express");
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
} = require("../controllers/customerController"); // Will create this soon

const router = express.Router();

// CRUD operations for customers
router.get("/", getAllCustomers); // Get all customers
router.get("/search", searchCustomers); // Search customers
router.get("/:id", getCustomerById); // Get customer by ID
router.post("/", createCustomer); // Create a new customer
router.put("/:id", updateCustomer); // Update customer by ID
router.delete("/:id", deleteCustomer); // Delete customer by ID

module.exports = router;
