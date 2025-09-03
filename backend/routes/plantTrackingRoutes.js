import express from "express";
import pool from "../config/db.js"; // Database connection
import authMiddleware from "../middleware/authMiddleware.js"; // Auth middleware

const router = express.Router();

/**
 * POST: Add a plant to tracking
 */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { plant_id, nickname } = req.body;
    const user_id = req.user.id;

    // Check if the plant exists
    const plantCheck = await pool.query("SELECT * FROM plants WHERE id = $1", [plant_id]);
    if (plantCheck.rows.length === 0) {
      return res.status(404).json({ error: "Plant not found" });
    }

    // Insert into plant_tracking
    const insertResult = await pool.query(
      "INSERT INTO plant_tracking (user_id, plant_id, nickname) VALUES ($1, $2, $3) RETURNING *",
      [user_id, plant_id, nickname]
    );

    // Return full details of the newly tracked plant
    const trackingId = insertResult.rows[0].id;

    const fullData = await pool.query(
      `SELECT pt.id, p.name AS plant_name, pt.nickname, pt.date_added
       FROM plant_tracking pt
       JOIN plants p ON pt.plant_id = p.id
       WHERE pt.id = $1`,
      [trackingId]
    );

    res.status(201).json(fullData.rows[0]);
  } catch (error) {
    console.error("Error adding plant to tracking:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET: Get all tracked plants for a user
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT pt.id, p.name AS plant_name, pt.nickname, pt.date_added
       FROM plant_tracking pt
       JOIN plants p ON pt.plant_id = p.id
       WHERE pt.user_id = $1
       ORDER BY pt.date_added DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tracked plants:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE: Remove a plant from tracking
 */
router.delete("/remove/:tracking_id", authMiddleware, async (req, res) => {
  try {
    const { tracking_id } = req.params;
    const user_id = req.user.id;

    const trackingCheck = await pool.query(
      "SELECT * FROM plant_tracking WHERE id = $1 AND user_id = $2",
      [tracking_id, user_id]
    );

    if (trackingCheck.rows.length === 0) {
      return res.status(404).json({ error: "Tracking entry not found or unauthorized" });
    }

    await pool.query("DELETE FROM plant_tracking WHERE id = $1", [tracking_id]);

    res.json({ message: "Plant removed from tracking successfully" });
  } catch (error) {
    console.error("Error removing plant from tracking:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
