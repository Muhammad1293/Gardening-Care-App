import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST: Add a health monitoring entry
 */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const {
      tracking_id,
      moisture_level,
      pest_presence,
      nutrient_deficiency
    } = req.body;

    const user_id = req.user.id;

    //  Convert tracking_id to integer
    const parsedTrackingId = parseInt(tracking_id);
    if (isNaN(parsedTrackingId)) {
      return res.status(400).json({ error: "Invalid tracking ID" });
    }

    //  Convert pest_presence to boolean
    const pestPresenceBoolean = pest_presence?.toLowerCase() === "yes";

    //  Ensure tracking entry belongs to the user
    const trackingCheck = await pool.query(
      "SELECT * FROM plant_tracking WHERE id = $1 AND user_id = $2",
      [parsedTrackingId, user_id]
    );

    if (trackingCheck.rows.length === 0) {
      return res.status(404).json({ error: "Tracking entry not found or unauthorized" });
    }

    //  Insert into health_monitoring
    const result = await pool.query(
      `INSERT INTO health_monitoring (
        tracking_id, moisture_level, pest_presence, nutrient_deficiency
) VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [parsedTrackingId, moisture_level, pestPresenceBoolean, nutrient_deficiency]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(" Error adding health monitoring entry:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET: Fetch health monitoring entries
 */
router.get("/:tracking_id", authMiddleware, async (req, res) => {
  try {
    const { tracking_id } = req.params;
    const user_id = req.user.id;

    // Check ownership
    const trackingCheck = await pool.query(
      "SELECT * FROM plant_tracking WHERE id = $1 AND user_id = $2",
      [tracking_id, user_id]
    );

    if (trackingCheck.rows.length === 0) {
      return res.status(404).json({ error: "Tracking entry not found or unauthorized" });
    }

    // Fetch health logs
    const result = await pool.query(
      "SELECT * FROM health_monitoring WHERE tracking_id = $1 ORDER BY recorded_at DESC",
      [tracking_id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(" Error fetching health monitoring records:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE /remove/:id - Delete a health monitoring entry
 */
router.delete("/remove/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if the health data belongs to the user
    const result = await pool.query(
      `DELETE FROM health_monitoring
       WHERE id = $1 AND tracking_id IN (
         SELECT id FROM plant_tracking WHERE user_id = $2
       )
       RETURNING *`,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Entry not found or unauthorized" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting health data:", error);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;
