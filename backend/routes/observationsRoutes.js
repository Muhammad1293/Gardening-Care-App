import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST: Add an observation for a tracked plant
 */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { tracking_id, note, observation_type, recorded_at } = req.body;
    const user_id = req.user.id;

    // Ensure the tracking entry exists and belongs to the user
    const trackingCheck = await pool.query(
      "SELECT * FROM plant_tracking WHERE id = $1 AND user_id = $2",
      [tracking_id, user_id]
    );

    if (trackingCheck.rows.length === 0) {
      return res.status(404).json({ error: "Tracking entry not found or unauthorized" });
    }

    // Insert the observation entry
    const result = await pool.query(
      `INSERT INTO observations (tracking_id, note, observation_type, recorded_at)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [tracking_id, note, observation_type, recorded_at]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding observation:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET: Get all observations for a tracked plant
 */
router.get("/:tracking_id", authMiddleware, async (req, res) => {
  try {
    const { tracking_id } = req.params;
    const user_id = req.user.id;

    // Ensure the tracking entry belongs to the user
    const trackingCheck = await pool.query(
      "SELECT * FROM plant_tracking WHERE id = $1 AND user_id = $2",
      [tracking_id, user_id]
    );

    if (trackingCheck.rows.length === 0) {
      return res.status(404).json({ error: "Tracking entry not found or unauthorized" });
    }

    // Retrieve observations ordered by date
    const result = await pool.query(
      "SELECT * FROM observations WHERE tracking_id = $1 ORDER BY recorded_at DESC",
      [tracking_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching observations:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE: Remove an observation by ID
 */
router.delete("/remove/:id", authMiddleware, async (req, res) => {
  try {
    const observationId = req.params.id;
    const user_id = req.user.id;

    // Check if observation belongs to a plant tracked by the user
    const observationCheck = await pool.query(
      `SELECT o.id FROM observations o
       JOIN plant_tracking pt ON o.tracking_id = pt.id
       WHERE o.id = $1 AND pt.user_id = $2`,
      [observationId, user_id]
    );

    if (observationCheck.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized or observation not found" });
    }

    // Delete the observation
    await pool.query("DELETE FROM observations WHERE id = $1", [observationId]);

    res.json({ message: "Observation removed successfully" });
  } catch (error) {
    console.error("Error removing observation:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
