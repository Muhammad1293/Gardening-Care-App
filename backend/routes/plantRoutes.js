import express from "express";
import pool from "../config/db.js"; // Database connection

const router = express.Router();

//  Route: Get all plants
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM plants");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching plants:", error);
    res.status(500).json({ error: "Server error" });
  }
});

//  Route: Search plants (Full or Partial Match)
router.get("/search", async (req, res) => {
  try {
    const { name, category, soil_type, climate } = req.query;
    let query = "SELECT id, name, category, soil_type, climate, care_instructions FROM plants WHERE 1=1";
    let params = [];

    if (name) {
      params.push(`%${name}%`);
      query += ` AND LOWER(name) ILIKE LOWER($${params.length})`;
    }
    if (category) {
      params.push(`%${category}%`);
      query += ` AND LOWER(category) ILIKE LOWER($${params.length})`;
    }
    if (soil_type) {
      params.push(`%${soil_type}%`);
      query += ` AND LOWER(soil_type) ILIKE LOWER($${params.length})`;
    }
    if (climate) {
      params.push(`%${climate}%`);
      query += ` AND LOWER(climate) ILIKE LOWER($${params.length})`;
    }

    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No matching plants found." });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error searching plants:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
