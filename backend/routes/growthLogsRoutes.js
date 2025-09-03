import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

//  Setup Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/growth_logs";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `log_${timestamp}${ext}`);
  },
});
const upload = multer({ storage });

/**
 *  NEW: POST /upload-image - Upload only the image
 */
router.post("/upload-image", authMiddleware, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imageUrl = `/uploads/growth_logs/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

/**
 *  GET /tracked - Fetch tracked plants for dropdown
 */
router.get("/tracked", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;
    const result = await pool.query(
      `SELECT pt.id, p.name
       FROM plant_tracking pt
       JOIN plants p ON pt.plant_id = p.id
       WHERE pt.user_id = $1`,
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tracked plants:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 *  POST /add - Add a new growth log entry (with image upload)
 */
router.post("/add", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { tracking_id, growth_stage, height_cm, observation_date } = req.body;
    const user_id = req.user.id;

    // Ensure tracking entry belongs to user
    const trackingCheck = await pool.query(
      "SELECT * FROM plant_tracking WHERE id = $1 AND user_id = $2",
      [tracking_id, user_id]
    );
    if (trackingCheck.rows.length === 0) {
      return res.status(404).json({ error: "Tracking entry not found or unauthorized" });
    }

    // Prepare image URL if uploaded
    const image_url = req.file ? `/uploads/growth_logs/${req.file.filename}` : "";

    // Insert growth log
    const result = await pool.query(
      `INSERT INTO growth_logs (tracking_id, growth_stage, height_cm, image_url, logged_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [tracking_id, growth_stage, height_cm, image_url || "", observation_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding growth log:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 *  GET /:tracking_id - Get all growth logs for one tracked plant
 */
router.get("/:tracking_id", authMiddleware, async (req, res) => {
  try {
    const { tracking_id } = req.params;
    const user_id = req.user.id;

    // Ensure user owns the tracking entry
    const trackingCheck = await pool.query(
      "SELECT * FROM plant_tracking WHERE id = $1 AND user_id = $2",
      [tracking_id, user_id]
    );
    if (trackingCheck.rows.length === 0) {
      return res.status(404).json({ error: "Unauthorized or not found" });
    }

    const logs = await pool.query(
      `SELECT gl.*, p.name AS plant_name
       FROM growth_logs gl
       JOIN plant_tracking pt ON gl.tracking_id = pt.id
       JOIN plants p ON pt.plant_id = p.id
       WHERE gl.tracking_id = $1
       ORDER BY gl.logged_at DESC`,
      [tracking_id]
    );

    res.json(logs.rows);
  } catch (error) {
    console.error("Error fetching growth logs:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE: Remove a growth log by ID
 */
router.delete("/remove/:log_id", authMiddleware, async (req, res) => {
  try {
    const { log_id } = req.params;
    const user_id = req.user.id;

    // Verify ownership of the growth log
    const ownershipCheck = await pool.query(
      `SELECT gl.id
       FROM growth_logs gl
       JOIN plant_tracking pt ON gl.tracking_id = pt.id
       WHERE gl.id = $1 AND pt.user_id = $2`,
      [log_id, user_id]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized to delete this log" });
    }

    await pool.query("DELETE FROM growth_logs WHERE id = $1", [log_id]);
    res.json({ message: "Growth log deleted successfully" });
  } catch (error) {
    console.error("Error deleting growth log:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
