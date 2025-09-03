import React, { useState, useEffect } from "react";
import {
  Box, Toolbar, Typography, Paper, FormControl,
  InputLabel, Select, MenuItem,  Button,
  Table, TableContainer, TableHead, TableRow, TableCell,
  TableBody, IconButton
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const HealthMonitoring = () => {
  const navigate = useNavigate();
  const { trackingId } = useParams();

  const [trackedPlants, setTrackedPlants] = useState([]);
  const [healthData, setHealthData] = useState([]);
  const [moistureLevel, setMoistureLevel] = useState("");
  const [pestPresence, setPestPresence] = useState("");
  const [nutrientDeficiency, setNutrientDeficiency] = useState("");
  const [selectedTrackingId, setSelectedTrackingId] = useState("");
  const moistureOptions = ["Low", "Medium", "High"];
  const nutrientOptions = [
    "None", "Nitrogen Deficiency", "Phosphorus Deficiency", "Potassium Deficiency", "Multiple Deficiencies"
  ];

  useEffect(() => {
    fetchTrackedPlants();
    if (trackingId) {
      setSelectedTrackingId(trackingId);
      fetchHealthData(trackingId);
    }
  }, [trackingId]);

  const fetchTrackedPlants = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/plant-tracking", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrackedPlants(res.data);
    } catch (err) {
      console.error("Error fetching tracked plants:", err);
    }
  };

  const fetchHealthData = async (tid) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/health-monitoring/${tid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHealthData(res.data);
    } catch (err) {
      console.error("Error fetching health data:", err);
    }
  };

  const handleAddHealthData = async () => {
    if (!selectedTrackingId || !moistureLevel || !pestPresence) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/health-monitoring/add",
        {
          tracking_id: selectedTrackingId,
          moisture_level: moistureLevel,
          pest_presence: pestPresence,
          nutrient_deficiency: nutrientDeficiency,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHealthData([res.data, ...healthData]);
      setMoistureLevel(""); setPestPresence(""); setNutrientDeficiency("");
    } catch (err) {
      console.error("Error adding health data:", err);
    }
  };

  const handleRemoveHealthData = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/health-monitoring/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHealthData(healthData.filter(item => item.id !== id));
    } catch (err) {
      console.error("Error deleting health data:", err);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#E8F5E9" }}>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* NavBar */}
     <Navbar />

      {/* Space below Navbar */}
      <Toolbar />

        <Box sx={{ p: 3 }}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Add Health Data
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Select Plant</InputLabel>
                <Select
                  value={selectedTrackingId}
                  onChange={(e) => {
                    setSelectedTrackingId(e.target.value);
                    fetchHealthData(e.target.value)
                  }}
                  label="Select Plant"
                >
                  <MenuItem value="">Choose Plant</MenuItem>
                  {trackedPlants.map(p => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.plant_name || p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Moisture Level</InputLabel>
                <Select
                  value={moistureLevel}
                  onChange={(e) => setMoistureLevel(e.target.value)}
                  label="Moisture Level"
                >
                  <MenuItem value="">Select</MenuItem>
                  {moistureOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Pest?</InputLabel>
                <Select
                  value={pestPresence}
                  onChange={(e) => setPestPresence(e.target.value)}
                  label="Pest?"
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Nutrient Deficiency</InputLabel>
                <Select
                  value={nutrientDeficiency}
                  onChange={(e) => setNutrientDeficiency(e.target.value)}
                  label="Nutrient Deficiency"
                >
                  <MenuItem value="">Select</MenuItem>
                  {nutrientOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={handleAddHealthData}
                sx={{ height: 56 }}
              >
                Add Data
              </Button>
            </Box>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "green" }}>
                  {["Moisture", "Pest", "Nutrient Deficiency", "Recorded At", "Actions"].map(col => (
                    <TableCell key={col} sx={{ fontWeight: "bold", color: "white" }}>{col}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {healthData.map(item => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ fontSize: "1rem" }}>{item.moisture_level}</TableCell>
                    <TableCell sx={{ fontSize: "1rem" }}>{item.pest_presence ? "Yes" : "No"}</TableCell>
                    <TableCell sx={{ fontSize: "1rem" }}>{item.nutrient_deficiency || "-"}</TableCell>
                    <TableCell sx={{ fontSize: "1rem" }}>{new Date(item.recorded_at || item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleRemoveHealthData(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default HealthMonitoring;
