import express from "express";
import { getPlantsByCategory } from "../controllers/plantIdentifyController.js";

const router = express.Router();

// Route: /api/plant-identify/:category
router.get("/:category", getPlantsByCategory);

export default router;
