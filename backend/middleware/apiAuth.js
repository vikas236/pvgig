// backend/middleware/apiAuth.js
const dotenv = require("dotenv");
dotenv.config();

module.exports = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: "Unauthorized: Invalid API key" });
  }
  next();
};
