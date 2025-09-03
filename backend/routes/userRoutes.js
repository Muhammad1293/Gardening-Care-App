import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get User Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT username, email, role, location, climate, soil_type, gardening_preferences FROM users WHERE user_id = $1",
      [req.user.user_id]
    );

    if (user.rows.length === 0) return res.status(404).json({ message: "User not found" });

    res.json(user.rows[0]);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update User Profile
router.put("/profile", authMiddleware, async (req, res) => {
  const {
    username,
    email,
    role,
    location,
    climate,
    soil_type,
    gardening_preferences,
  } = req.body;

  // Basic validation (can be extended)
  if (!username || !email || !role) {
    return res.status(400).json({ message: "Username, email, and role are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    await pool.query(
      `UPDATE users 
       SET username = $1, email = $2, role = $3, location = $4, climate = $5, soil_type = $6, gardening_preferences = $7 
       WHERE user_id = $8`,
      [username, email, role, location, climate, soil_type, gardening_preferences, req.user.user_id]
    );

    res.json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
