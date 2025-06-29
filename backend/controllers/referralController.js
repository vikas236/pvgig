// backend/controllers/referralController.js
const pool = require("../db");

// Get all referrals
async function getAllReferrals(req, res) {
  try {
    // Joining with anvi_users to get referrer and referred user details
    const query = `
            SELECT
                ar.referral_id,
                ar.referral_code,
                ar.status,
                ar.referral_bonus_amount,
                ar.created_at,
                ar.updated_at,
                ru.username AS referrer_username,
                ru.email AS referrer_email,
                reu.username AS referred_username,
                reu.email AS referred_email
            FROM
                anvi_referrals ar
            JOIN
                anvi_users ru ON ar.referrer_user_id = ru.user_id
            JOIN
                anvi_users reu ON ar.referred_user_id = reu.user_id
            ORDER BY
                ar.created_at DESC;
        `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching all referrals:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

// Get a single referral by ID
async function getReferralById(req, res) {
  const { id } = req.params;
  try {
    const query = `
            SELECT
                ar.referral_id,
                ar.referral_code,
                ar.status,
                ar.referral_bonus_amount,
                ar.created_at,
                ar.updated_at,
                ru.username AS referrer_username,
                ru.email AS referrer_email,
                reu.username AS referred_username,
                reu.email AS referred_email
            FROM
                anvi_referrals ar
            JOIN
                anvi_users ru ON ar.referrer_user_id = ru.user_id
            JOIN
                anvi_users reu ON ar.referred_user_id = reu.user_id
            WHERE
                ar.referral_id = $1;
        `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Referral not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching referral by ID:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

// Update referral status (e.g., from pending to completed)
async function updateReferralStatus(req, res) {
  const { id } = req.params;
  const { status, referralBonusAmount } = req.body; // Status: 'pending', 'completed', 'cancelled'

  if (!status) {
    return res
      .status(400)
      .json({ message: "Status is required to update a referral." });
  }

  try {
    const result = await pool.query(
      "UPDATE anvi_referrals SET status = $1, referral_bonus_amount = COALESCE($2, referral_bonus_amount), updated_at = CURRENT_TIMESTAMP WHERE referral_id = $3 RETURNING *",
      [status, referralBonusAmount, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Referral not found." });
    }
    res.status(200).json({
      message: "Referral updated successfully!",
      referral: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating referral status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = {
  getAllReferrals,
  getReferralById,
  updateReferralStatus,
};
