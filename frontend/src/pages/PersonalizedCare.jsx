import React, { useState, useEffect } from "react";
import {
  Toolbar, Typography, Box, Paper, TextField, MenuItem, Autocomplete, Alert,
  FormControl, InputLabel, Select, 
  Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const PersonalizedCare = () => {
  const navigate = useNavigate();
 
  // Weather state
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");

  const [selectedPlant, setSelectedPlant] = useState("");
  const [location, setLocation] = useState("");
  const [climate, setClimate] = useState("");
  const [soilType, setSoilType] = useState("");
  const [locations, setLocations] = useState([]);
  const [climates, setClimates] = useState([]);
  const [soilTypes, setSoilTypes] = useState([]);
  const [plants, setPlants] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [user, setUser] = useState(null);


  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        setUser(data);
        setLocation(data.location || "");
        setClimate(data.climate || "");
        setSoilType(data.soil_type || "");
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchUserProfile();
  }, []);

  // Fetch dropdown data (locations/climates/soilTypes) on mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/plant-care/locations");
        setLocations(res.data.locations || []);
        setClimates(res.data.climates || []);
        setSoilTypes(res.data.soilTypes || []);
      } catch (err) {
        console.error("Error fetching dropdowns:", err);
      }
    };
    fetchDropdownData();
  }, []);

  // Auto-suggest plants when location/climate/soilType change
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/plant-care/auto-suggest", {
          params: { location, climate, soil_type: soilType },
        });
        setPlants(res.data || []);
      } catch (err) {
        console.error("Error fetching plants:", err);
      }
    };
    if (location && climate && soilType) {
      fetchPlants();
    }
  }, [location, climate, soilType]);

  // Fetch weather whenever location changes
  useEffect(() => {
    if (!location) {
      setWeather(null);
      setWeatherError("");
      return;
    }
    const fetchWeather = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/weather", {
          params: { location }
        });
        // Expecting res.data like: { temp, humidity, condition, wind_speed }
        setWeather(res.data);
        setWeatherError("");
      } catch (err) {
        console.error("Error fetching weather:", err);
        setWeather(null);
        setWeatherError("Could not fetch weather for this location.");
      }
    };
    fetchWeather();
  }, [location]);

  // Annotate recommendations with weather note
  const annotateRecommendations = (recs, weatherData) => {
    return recs.map(rec => {
      let note = "";
      if (weatherData) {
        const temp = weatherData.temp;
        const cond = (weatherData.condition || "").toLowerCase();
        if (cond.includes("rain") || cond.includes("cloud")) {
          note = "Consider skipping or reducing watering due to rain/cloudy conditions.";
        } else if (temp >= 30) {
          note = "High temperature—ensure extra hydration or shade.";
        } else if (temp <= 10) {
          note = "Low temperature—avoid overwatering.";
        }
      }
      return { ...rec, weatherNote: note };
    });
  };

  // Handle search for recommendations
  const handleSearch = async () => {
    setErrorMessage("");
    try {
      const token = localStorage.getItem("token");
      // Build params only with non-empty values:
      const params = {};
      if (selectedPlant) params.plant = selectedPlant;
      if (location)      params.location = location;
      if (climate)       params.climate = climate;
      if (soilType)      params.soil_type = soilType;

      const res = await axios.get("http://localhost:5000/api/plant-care/recommendations", {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      const recs = res.data.length ? res.data : [];
      // Annotate with current weather
      const annotated = annotateRecommendations(recs, weather);
      setRecommendations(annotated);
      setErrorMessage(recs.length ? "" : "No recommendations found.");
    } catch (err) {
      console.error("Error searching:", err);
      setRecommendations([]);
      setErrorMessage("Something went wrong.");
    }
  };

  return (
    <Box sx={{ width: "100vw", minHeight: "100vh", backgroundColor: "#E8F5E9" }}>
      {/* NavBar */}
          <Navbar />
     
           {/* Space below Navbar */}
           <Toolbar />

      {/* Content */}
      <Box sx={{ padding: 3 }}>
        <Paper sx={{ padding: 3 }}>
          <Typography variant="h6" fontWeight="bold">Get Personalized Recommendations</Typography>
          {/* Display weather info */}
          {weather && (
            <Paper sx={{ padding: 2, mt: 2, backgroundColor: "#fff" }}>
              <Typography variant="subtitle1" fontWeight="bold">Current Weather in {location}</Typography>
              <Typography>Temperature: {weather.temp}°C</Typography>
              <Typography>Humidity: {weather.humidity}%</Typography>
              <Typography>Condition: {weather.condition}</Typography>
            </Paper>
          )}
          {weatherError && (
            <Typography color="error" sx={{ mt: 1 }}>{weatherError}</Typography>
          )}
          {errorMessage && <Alert severity="error" sx={{ marginTop: 2 }}>{errorMessage}</Alert>}
          <Box sx={{ display: "flex", gap: 2, marginTop: 2, flexWrap: "wrap" }}>
            <Autocomplete
              options={plants}
              getOptionLabel={(option) => option}
              value={selectedPlant || null}
              onChange={(e, val) => setSelectedPlant(val || "")}
              isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => <TextField {...params} label="Search & Select Plant" />}
              sx={{ minWidth: 300, backgroundColor: "#fff" }}
            />
            <Autocomplete
              options={locations}
              getOptionLabel={(option) => option}
              value={location}
              onChange={(e, val) => setLocation(val)}
              renderInput={(params) => <TextField {...params} label="Select Location" />}
              sx={{ minWidth: 300, backgroundColor: "#fff" }}
            />
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Climate</InputLabel>
              <Select value={climate} onChange={(e) => setClimate(e.target.value)} label="Climate">
                {climates.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Soil Type</InputLabel>
              <Select value={soilType} onChange={(e) => setSoilType(e.target.value)} label="Soil Type">
                {soilTypes.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<SearchIcon />} color="success" onClick={handleSearch}>
              Get Recommendations
            </Button>
          </Box>

          {/* Recommendations Table */}
          {recommendations.length > 0 && (
            <Box sx={{ marginTop: 4 }}>
              <Typography variant="h6" fontWeight="bold">Recommended Care</Typography>
              <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "green" }}>
                      <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Plant</TableCell>
                      <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Watering</TableCell>
                      <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Fertilization</TableCell>
                      <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Pest Control</TableCell>
                      <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Note</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recommendations.map((rec, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontSize: "1rem" }}>{rec.plant_name}</TableCell>
                        <TableCell sx={{ fontSize: "1rem" }}>{rec.watering_schedule}</TableCell>
                        <TableCell sx={{ fontSize: "1rem" }}>{rec.fertilization_plan}</TableCell>
                        <TableCell sx={{ fontSize: "1rem" }}>{rec.pest_control}</TableCell>
                        <TableCell sx={{ fontSize: "1rem" }}>{rec.weatherNote}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default PersonalizedCare;
