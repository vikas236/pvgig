// backend/controllers/customerController.js
const pool = require("../db");

// Get all customers
async function getAllCustomers(req, res) {
  try {
    const result = await pool.query(
      "SELECT user_id, username, email, full_name, phone_number, address, wallet_balance, created_at, updated_at FROM anvi_users WHERE role = 'customer' ORDER BY created_at DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching all customers:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

// Get customer by ID
async function getCustomerById(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT user_id, username, email, full_name, phone_number, address, wallet_balance, created_at, updated_at FROM anvi_users WHERE user_id = $1 AND role = 'customer'",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

// Create a new customer with simplified requirements
async function createCustomer(req, res) {
  const { full_name, phone_number, address, wallet_balance } = req.body;

  // Validate required fields
  if (!full_name) {
    return res.status(400).json({ message: "Full name is required." });
  }

  try {
    // Generate username from full_name (lowercase, replace spaces with underscores)
    const username = full_name.toLowerCase().replace(/\s+/g, "_");

    // Generate password from username (you might want something more secure in production)
    const password = username + "123"; // Simple example - append "123"

    // Default email
    const email = "pvgighub@gmail.com";

    // Hash the generated password
    const hashedPassword = await require("./authController").hashPassword(
      password
    );

    const result = await pool.query(
      `INSERT INTO anvi_users 
      (username, password_hash, email, full_name, phone_number, address, wallet_balance, role) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'customer') 
      RETURNING user_id, full_name, phone_number, address, wallet_balance`,
      [
        username,
        hashedPassword,
        email,
        full_name,
        phone_number,
        address,
        wallet_balance || 0.0,
      ]
    );

    res.status(201).json({
      message: "Customer created successfully!",
      customer: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    if (error.code === "23505") {
      // Handle case where generated username already exists
      return res.status(409).json({
        message:
          "A customer with similar name already exists. Please provide a unique full name.",
      });
    }
    res.status(500).json({ message: "Internal server error." });
  }
}

// Update customer by ID
async function updateCustomer(req, res) {
  const { id } = req.params;
  const { full_name, phone_number, address, wallet_balance } = req.body;

  try {
    const result = await pool.query(
      `UPDATE anvi_users 
      SET full_name = $1, phone_number = $2, address = $3, 
      wallet_balance = $4, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = $5 AND role = 'customer' 
      RETURNING user_id, full_name, phone_number, address, wallet_balance`,
      [full_name, phone_number, address, wallet_balance, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }
    res.status(200).json({
      message: "Customer updated successfully!",
      customer: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

// Delete customer by ID
async function deleteCustomer(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM anvi_users WHERE user_id = $1 AND role = 'customer' RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }
    res.status(200).json({ message: "Customer deleted successfully!" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

// Search customers by name or phone
async function searchCustomers(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Search query is required." });
  }
  try {
    const result = await pool.query(
      `SELECT user_id, full_name, phone_number, address, 
      wallet_balance FROM anvi_users WHERE role = 'customer' AND 
      (full_name ILIKE $1 OR phone_number ILIKE $1) 
      ORDER BY full_name`,
      [`%${query}%`]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error searching customers:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
};
