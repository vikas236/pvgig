// backend/app.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./db");

const authRoutes = require("./routes/authRoutes.js");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const walletRoutes = require("./routes/walletRoutes");
const referralRoutes = require("./routes/referralRoutes");

const apiAuth = require("./middleware/apiAuth"); // 🔒 Import API key middleware

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://anvi-dashboard.pvgig.com"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-api-key", // ✅ Allow custom header
    ],
  })
);

app.use(express.json());

// ✅ Public route
app.get("/", (req, res) => {
  res.send("Anvi Fresh Mart Admin Dashboard API is running!");
});

// ✅ Public test route to check DB connection
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({
      message: "Database connection successful!",
      currentTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Error testing database connection:", error);
    res.status(500).json({
      message: "Database connection failed!",
      error: error.message,
    });
  }
});

// ✅ Use API key middleware for all protected routes
app.use((req, res, next) => {
  if (["/", "/test-db"].includes(req.path)) return next();
  return apiAuth(req, res, next);
});

// ✅ Secure routes
app.use("/admin", authRoutes);
app.use("/customers", customerRoutes);
app.use("/orders", orderRoutes);
app.use("/wallet", walletRoutes);
app.use("/referrals", referralRoutes);

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access: http://localhost:${PORT}`);
});
