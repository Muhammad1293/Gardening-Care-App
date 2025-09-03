// routes/gardenPlannerRoutes.js
import express from "express";
import {
  getGardenPlans,
  createGardenPlan,
  deleteGardenPlan,
} from "../controllers/gardenPlannerController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Secure all routes with auth middleware
router.use(authMiddleware);

// Routes
router.get("/", getGardenPlans);         // GET /api/garden-planner
router.post("/", createGardenPlan);      // POST /api/garden-planner
router.delete("/:id", deleteGardenPlan); // DELETE /api/garden-planner/:id

export default router;
