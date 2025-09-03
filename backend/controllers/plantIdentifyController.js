// backend/controllers/plantIdentifyController.js
import pool from "../config/db.js";

// GET /api/plant-identify/:category
export const getPlantsByCategory = async (req, res) => {
  const category = req.params.category;

  try {
    const result = await pool.query(
      'SELECT id, name FROM plants WHERE category = $1',
      [category]
    );

    const plantsWithImages = result.rows.map((plant, index) => {
      const formattedName = plant.name.toLowerCase().replace(/\s+/g, "_");
      const image_url = `/plant-images/${formattedName}.jpg`; // served from backend/public/plant-images

      return {
        ...plant,
        image_url
      };
    });

    res.status(200).json(plantsWithImages);
  } catch (err) {
    console.error("Error fetching plants:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
