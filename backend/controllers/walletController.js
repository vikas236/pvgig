// backend/controllers/walletController.js
const pool = require("../db");

// Adjust user's wallet balance (deposit/withdraw)
async function adjustWalletBalance(req, res) {
  const { userId } = req.params;
  const { amount, type, notes } = req.body; // type: 'credit' or 'debit'

  if (!amount || !type || !userId) {
    return res
      .status(400)
      .json({
        message: "User ID, amount, and type (credit/debit) are required.",
      });
  }

  if (isNaN(amount) || parseFloat(amount) <= 0) {
    return res
      .status(400)
      .json({ message: "Amount must be a positive number." });
  }

  const numericAmount = parseFloat(amount);

  try {
    // Start a transaction to ensure atomicity
    await pool.query("BEGIN");

    // Get current balance
    const userResult = await pool.query(
      "SELECT wallet_balance FROM anvi_users WHERE user_id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: "User not found." });
    }

    let newBalance = parseFloat(userResult.rows[0].wallet_balance);

    if (type === "credit") {
      newBalance += numericAmount;
    } else if (type === "debit") {
      if (newBalance < numericAmount) {
        await pool.query("ROLLBACK");
        return res
          .status(400)
          .json({ message: "Insufficient wallet balance for this debit." });
      }
      newBalance -= numericAmount;
    } else {
      await pool.query("ROLLBACK");
      return res
        .status(400)
        .json({
          message: 'Invalid transaction type. Must be "credit" or "debit".',
        });
    }

    // Update user's wallet balance
    const updateResult = await pool.query(
      "UPDATE anvi_users SET wallet_balance = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING wallet_balance",
      [newBalance, userId]
    );

    await pool.query("COMMIT"); // Commit the transaction

    res.status(200).json({
      message: `Wallet balance ${type}ed successfully.`,
      newBalance: updateResult.rows[0].wallet_balance,
    });
  } catch (error) {
    await pool.query("ROLLBACK"); // Rollback on any error
    console.error("Error adjusting wallet balance:", error);
    res
      .status(500)
      .json({ message: "Internal server error during wallet adjustment." });
  }
}

module.exports = {
  adjustWalletBalance,
};
