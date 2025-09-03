// routes/weatherRoutes.js
import express from "express";
import axios from "axios";
import authMiddleware from "../middleware/authMiddleware.js"; 

const router = express.Router();

// GET /api/weather?location=CityName
router.get("/", /*authMiddleware,*/ async (req, res) => {
  const { location } = req.query;
  if (!location) {
    return res.status(400).json({ error: "Location is required" });
  }
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.error("OPENWEATHER_API_KEY not set");
      return res.status(500).json({ error: "Weather API key not configured" });
    }
    // Call OpenWeatherMap current weather endpoint
    const url = `https://api.openweathermap.org/data/2.5/weather`;
    const response = await axios.get(url, {
      params: {
        q: location,
        units: "metric", // Celsius
        appid: apiKey,
      },
    });
    const data = response.data;
    // Extract relevant parts
    const weather = {
      temp: data.main.temp,
      humidity: data.main.humidity,
      condition: data.weather[0]?.description || "",
      wind_speed: data.wind.speed,
    };
    res.json(weather);
  } catch (error) {
    console.error("Error fetching weather:", error.response?.data || error.message);
    // If city not found or other error:
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: "Location not found" });
    }
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

export default router;
