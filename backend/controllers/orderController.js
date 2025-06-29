const pool = require("../db");

// Create a new order
async function createOrder(req, res) {
  const {
    user_id,
    total_amount,
    delivery_address,
    payment_method,
    notes = "",
    status = "pending",
  } = req.body;

  if (!user_id || !total_amount || !delivery_address) {
    return res.status(400).json({
      message: "user_id, total_amount, and delivery_address are required.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO anvi_orders 
        (user_id, total_amount, delivery_address, payment_method, notes, status) 
       VALUES 
        ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [user_id, total_amount, delivery_address, payment_method, notes, status]
    );

    res.status(201).json({
      message: "Order created successfully!",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

// Existing functions
async function getAllOrders(req, res) {
  const { userId, status, startDate, endDate } = req.query;
  let query = "SELECT * FROM anvi_orders";
  const queryParams = [];
  const conditions = [];

  if (userId) {
    conditions.push(`user_id = $${conditions.length + 1}`);
    queryParams.push(userId);
  }
  if (status) {
    conditions.push(`status = $${conditions.length + 1}`);
    queryParams.push(status);
  }
  if (startDate) {
    conditions.push(`order_date >= $${conditions.length + 1}`);
    queryParams.push(startDate);
  }
  if (endDate) {
    conditions.push(`order_date <= $${conditions.length + 1}`);
    queryParams.push(endDate);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY order_date DESC";

  try {
    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

async function getOrderById(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM anvi_orders WHERE order_id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

async function getOrdersByUser(req, res) {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM anvi_orders WHERE user_id = $1 ORDER BY order_date DESC",
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching orders by user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res
      .status(400)
      .json({ message: "Status is required to update an order." });
  }

  try {
    const result = await pool.query(
      "UPDATE anvi_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2 RETURNING *",
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.status(200).json({
      message: "Order status updated successfully!",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

// Search orders by various criteria
async function searchOrders(req, res) {
  const { search, userId, status } = req.query;

  if (!search) {
    return res.status(400).json({ message: "Search term is required." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM anvi_orders 
       WHERE (
         CAST(order_id AS TEXT) LIKE $1 OR
         CAST(user_id AS TEXT) LIKE $1 OR
         delivery_address ILIKE $1 OR
         payment_method ILIKE $1 OR
         status ILIKE $1
       )
       ${userId ? " AND user_id = $2" : ""}
       ${status ? " AND status = $" + (userId ? "3" : "2") : ""}
       ORDER BY order_date DESC`,
      [
        `%${search}%`,
        ...(userId ? [userId] : []),
        ...(status ? [status] : []),
      ].filter(Boolean)
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error searching orders:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  searchOrders,
};
