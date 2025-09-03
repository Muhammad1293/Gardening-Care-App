// controllers/gardenPlannerController.js
import pool from "../config/db.js";

// GET: Get all garden plans for a user
export const getGardenPlans = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const result = await pool.query(
      "SELECT * FROM garden_plans WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching garden plans:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST: Add a new garden plan
export const createGardenPlan = async (req, res) => {
  const userId = req.user.user_id;
  const { section, plant, notes } = req.body;

  if (!section || !plant) {
    return res.status(400).json({ error: "Section and plant are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO garden_plans (user_id, section, plant, notes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, section, plant, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding garden plan:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE: Delete a garden plan by ID
export const deleteGardenPlan = async (req, res) => {
  const userId = req.user.user_id;
  const planId = req.params.id;

  try {
    const result = await pool.query(
      "DELETE FROM garden_plans WHERE id = $1 AND user_id = $2 RETURNING *",
      [planId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Garden plan not found or unauthorized" });
    }

    res.status(200).json({ message: "Garden plan deleted" });
  } catch (err) {
    console.error("Error deleting garden plan:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
