// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import plantRoutes from "./routes/plantRoutes.js"; // Plant routes
import plantCareRoutes from "./routes/plantCareRoutes.js"; // Plant Care Recommendations
import plantTrackingRoutes from "./routes/plantTrackingRoutes.js"; // Added Plant Tracking routes
import growthLogsRoutes from "./routes/growthLogsRoutes.js";
import observationsRoutes from "./routes/observationsRoutes.js";
import healthMonitoringRoutes from "./routes/healthMonitoringRoutes.js";
import remindersRoutes from "./routes/remindersRoutes.js";
import pool from "./config/db.js"; // Database connection
import weatherRoutes from "./routes/weatherRoutes.js";
import plantIdentifyRoutes from "./routes/plantIdentifyRoutes.js";
import gardenPlannerRoutes from "./routes/gardenPlannerRoutes.js";
import articleRoutes from './routes/articleRoutes.js';





// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Test Database Connection Before Starting Server
const testDBConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Database connected successfully!");
    client.release();
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1); // Stop server if DB connection fails
  }
};



// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/plant-care", plantCareRoutes);
app.use("/api/plant-tracking", plantTrackingRoutes);
app.use("/api/growth-logs", growthLogsRoutes);
app.use("/api/observations", observationsRoutes);
app.use("/api/health-monitoring", healthMonitoringRoutes);
app.use("/api/reminders", remindersRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/plant-identify", plantIdentifyRoutes);
app.use("/api/garden-planner", gardenPlannerRoutes);
app.use('/api/articles', articleRoutes);
app.use("/plant-images", express.static("public/plant-images"));
app.use("/uploads/growth_logs", express.static("uploads/growth_logs"));




// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Default Route (Optional)
app.get("/", (req, res) => {
  res.send("🌱 Gardening Care API is running...");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start Server After Confirming DB Connection
const PORT = process.env.PORT || 5000;
testDBConnection().then(() => {
  app.listen(PORT, () => {
    console.log(` Server is running on http://localhost:${PORT}`);
  });
});
