import express from "express";
import pool from "../config/db.js"; // Database connection
import authMiddleware from "../middleware/authMiddleware.js"; // Protect routes

const router = express.Router();

/**
 *  POST: Add a new reminder for a tracked plant
 */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { tracking_id, reminder_type, reminder_date, frequency } = req.body;
    const user_id = req.user.id; // Extracted from JWT token

    // Ensure the tracking entry exists and belongs to the user
    const trackingCheck = await pool.query(
      "SELECT * FROM plant_tracking WHERE id = $1 AND user_id = $2",
      [tracking_id, user_id]
    );

    if (trackingCheck.rows.length === 0) {
      return res.status(404).json({ error: "Tracking entry not found or unauthorized" });
    }

    // Insert the reminder entry
    const result = await pool.query(
      "INSERT INTO reminders (tracking_id, reminder_type, reminder_date, frequency) VALUES ($1, $2, $3, $4) RETURNING *",
      [tracking_id, reminder_type, reminder_date, frequency]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(" Error adding reminder:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 *  GET: Get all reminders for a user
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT r.id, r.reminder_type, r.reminder_date, r.frequency, p.name AS plant_name 
       FROM reminders r
       JOIN plant_tracking pt ON r.tracking_id = pt.id
       JOIN plants p ON pt.plant_id = p.id
       WHERE pt.user_id = $1
       ORDER BY r.reminder_date ASC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(" Error fetching reminders:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 *  DELETE: Remove a reminder
 */
router.delete("/remove/:reminder_id", authMiddleware, async (req, res) => {
  try {
    const { reminder_id } = req.params;
    const user_id = req.user.id;

    // Ensure the reminder belongs to the user
    const reminderCheck = await pool.query(
      `SELECT r.id FROM reminders r
       JOIN plant_tracking pt ON r.tracking_id = pt.id
       WHERE r.id = $1 AND pt.user_id = $2`,
      [reminder_id, user_id]
    );

    if (reminderCheck.rows.length === 0) {
      return res.status(404).json({ error: "Reminder not found or unauthorized" });
    }

    await pool.query("DELETE FROM reminders WHERE id = $1", [reminder_id]);

    res.json({ message: "Reminder removed successfully" });
  } catch (error) {
    console.error(" Error removing reminder:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 *  GET: Fetch reminders that are due (reminder_date <= now)
 */
router.get("/due", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT r.id, r.reminder_type, r.reminder_date, r.frequency, p.name AS plant_name
       FROM reminders r
       JOIN plant_tracking pt ON r.tracking_id = pt.id
       JOIN plants p ON pt.plant_id = p.id
       WHERE pt.user_id = $1 AND r.reminder_date <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Karachi')  AND r.is_done = false
       ORDER BY r.reminder_date DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching due reminders:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 *  PATCH: Mark a reminder as done
 */
router.patch("/mark-done/:reminder_id", authMiddleware, async (req, res) => {
  try {
    const { reminder_id } = req.params;
    const user_id = req.user.id;

    const reminderCheck = await pool.query(
      `SELECT r.id FROM reminders r
       JOIN plant_tracking pt ON r.tracking_id = pt.id
       WHERE r.id = $1 AND pt.user_id = $2`,
      [reminder_id, user_id]
    );

    if (reminderCheck.rows.length === 0) {
      return res.status(404).json({ error: "Reminder not found or unauthorized" });
    }

    await pool.query("UPDATE reminders SET is_done = true WHERE id = $1", [reminder_id]);

    res.json({ message: "Reminder marked as done" });
  } catch (error) {
    console.error("Error marking reminder as done:", error);
    res.status(500).json({ error: "Server error" });
  }
});



export default router;
