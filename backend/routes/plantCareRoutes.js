import express from "express";
import pool from "../config/db.js"; // Database connection
import authMiddleware from "../middleware/authMiddleware.js"; // Protect routes

const router = express.Router();

/**
 * GET: Fetch distinct locations, climates, and soil types
 */
router.get("/locations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT location, climate, soil_type FROM plant_care_recommendations
    `);
    const locations = [...new Set(result.rows.map(row => row.location))];
    const climates  = [...new Set(result.rows.map(row => row.climate))];
    const soilTypes = [...new Set(result.rows.map(row => row.soil_type))];
    res.json({ locations, climates, soilTypes });
  } catch (error) {
    console.error("Error fetching dropdown data:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET: Auto-suggest plants based on location/climate/soil_type
 */
router.get("/auto-suggest", async (req, res) => {
  try {
    const { location, climate, soil_type } = req.query;
    const suggestedPlants = new Set();

    // From plant_care_recommendations (priority)
    const recommendationQuery = `
      SELECT DISTINCT plant_name FROM plant_care_recommendations
      WHERE 
        ($1::text IS NULL OR location ILIKE $1) AND
        ($2::text IS NULL OR climate ILIKE $2) AND
        ($3::text IS NULL OR soil_type ILIKE $3)
    `;
    const recParams = [
      location || null,
      climate  || null,
      soil_type|| null,
    ];
    const recResult = await pool.query(recommendationQuery, recParams);
    recResult.rows.forEach(row => {
      if (row.plant_name) suggestedPlants.add(row.plant_name);
    });

    // From plants table as fallback
    const plantQuery = `
      SELECT DISTINCT name FROM plants
      WHERE 
        ($1::text IS NULL OR climate ILIKE $1) AND
        ($2::text IS NULL OR soil_type ILIKE $2)
    `;
    const plantParams = [
      climate  || null,
      soil_type|| null,
    ];
    const plantResult = await pool.query(plantQuery, plantParams);
    plantResult.rows.forEach(row => {
      if (row.name) suggestedPlants.add(row.name);
    });

    res.json([...suggestedPlants]);
  } catch (error) {
    console.error("Error in /auto-suggest:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET: Fetch Personalized Plant Care Recommendations
 * 1) If `plant` provided:
 *    a) Try strict AND-match on plant_name + other filters.
 *    b) If none, fallback to ANY recommendations for that plant (ignore location/climate/soil_type).
 * 2) If no `plant`:
 *    a) Try strict AND-match on provided filters.
 *    b) If none and at least one filter given, fallback to OR-match among provided filters.
 *    c) If no filters at all, return all records.
 */
router.get("/recommendations", authMiddleware, async (req, res) => {
  try {
    const { plant, location, climate, soil_type } = req.query;

    // === 1. If plant provided ===
    if (plant) {
      // a) strict AND-match: plant + any other provided filters
      let strictQuery = "SELECT * FROM plant_care_recommendations WHERE LOWER(plant_name) = LOWER($1)";
      const strictParams = [plant.trim()];
      if (location) {
        strictParams.push(location.trim());
        strictQuery += ` AND LOWER(location) = LOWER($${strictParams.length})`;
      }
      if (climate) {
        strictParams.push(climate.trim());
        strictQuery += ` AND LOWER(climate) = LOWER($${strictParams.length})`;
      }
      if (soil_type) {
        strictParams.push(soil_type.trim());
        strictQuery += ` AND LOWER(soil_type) = LOWER($${strictParams.length})`;
      }
      const strictResult = await pool.query(strictQuery, strictParams);
      if (strictResult.rows.length > 0) {
        return res.json(strictResult.rows);
      }
      // b) fallback: return any recommendations for that plant (ignore other filters)
      const fallbackPlantQuery = `
        SELECT * FROM plant_care_recommendations
        WHERE LOWER(plant_name) = LOWER($1)
      `;
      const fallbackPlantResult = await pool.query(fallbackPlantQuery, [plant.trim()]);
      return res.json(fallbackPlantResult.rows);
    }

    // === 2. No plant provided ===
    // a) strict AND-match on provided filters
    let strictQuery = "SELECT * FROM plant_care_recommendations WHERE 1=1";
    const strictParams = [];
    if (location) {
      strictParams.push(location.trim());
      strictQuery += ` AND LOWER(location) = LOWER($${strictParams.length})`;
    }
    if (climate) {
      strictParams.push(climate.trim());
      strictQuery += ` AND LOWER(climate) = LOWER($${strictParams.length})`;
    }
    if (soil_type) {
      strictParams.push(soil_type.trim());
      strictQuery += ` AND LOWER(soil_type) = LOWER($${strictParams.length})`;
    }
    const strictResult2 = await pool.query(strictQuery, strictParams);
    if (strictResult2.rows.length > 0) {
      return res.json(strictResult2.rows);
    }

    // b) fallback OR-match among provided filters
    const orClauses = [];
    const orParams = [];
    if (location) {
      orParams.push(location.trim());
      orClauses.push(`LOWER(location) = LOWER($${orParams.length})`);
    }
    if (climate) {
      orParams.push(climate.trim());
      orClauses.push(`LOWER(climate) = LOWER($${orParams.length})`);
    }
    if (soil_type) {
      orParams.push(soil_type.trim());
      orClauses.push(`LOWER(soil_type) = LOWER($${orParams.length})`);
    }
    if (orClauses.length > 0) {
      const fallbackQuery = `
        SELECT * FROM plant_care_recommendations
        WHERE ${orClauses.join(" OR ")}
      `;
      const fallbackResult = await pool.query(fallbackQuery, orParams);
      return res.json(fallbackResult.rows);
    }

    // c) no filters at all → return all
    const all = await pool.query("SELECT * FROM plant_care_recommendations");
    return res.json(all.rows);

  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
