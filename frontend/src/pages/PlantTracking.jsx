import React, { useState, useEffect } from "react";
import {
  Toolbar, Typography, Box, Paper, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, FormControl, InputLabel, Select,
  MenuItem, IconButton, Button, 
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";

const PlantTracking = () => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [userPlants, setUserPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [nickname, setNickname] = useState("");
  const [user, setUser] = useState(null);
  

 useEffect(() => {
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const userRes = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userRes.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };
  fetchUser();
}, []);

useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const plantsRes = await axios.get("http://localhost:5000/api/plants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlants(plantsRes.data);

      const trackedRes = await axios.get("http://localhost:5000/api/plant-tracking", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserPlants(trackedRes.data);
    } catch (error) {
      console.error("Error fetching plants or tracked plants:", error);
    }
  };

  // Run only after user is loaded
  if (user) fetchData();
}, [user]);
 
  const handleAddPlant = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      "http://localhost:5000/api/plant-tracking/add",
      { plant_id: selectedPlant, nickname },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Make sure you append the new plant to userPlants
    if (response.data) {
      setUserPlants((prev) => [...prev, response.data]);
    }

    setSelectedPlant("");
    setNickname("");
  } catch (error) {
    console.error("Error adding plant:", error);
  }
};


  const handleRemovePlant = async (trackingId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/plant-tracking/remove/${trackingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserPlants(userPlants.filter((plant) => plant.id !== trackingId));
    } catch (error) {
      console.error("Error removing plant:", error);
    }
  };


  return (
    <Box sx={{ width: "100vw", minHeight: "100vh", backgroundColor: "#E8F5E9" }}>
       {/* NavBar */}
     <Navbar />

      {/* Space below Navbar */}
      <Toolbar />


      {/* Main Content */}
      <Box sx={{ padding: 3 }}>
        {/* Add New Plant Section */}
        <Paper sx={{ padding: 3, backgroundColor: "#FFFFFF", marginBottom: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}> Track a New Plant</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginTop: 2, flexWrap: "wrap" }}>
            <FormControl sx={{ minWidth: "200px" }}>
              <InputLabel>Select Plant</InputLabel>
              <Select value={selectedPlant} onChange={(e) => setSelectedPlant(e.target.value)}>
                <MenuItem value="">Choose a Plant</MenuItem>
                {plants.map((plant) => (
                  <MenuItem key={plant.id} value={plant.id}>{plant.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Nickname (Optional)"
              variant="outlined"
              sx={{ minWidth: "200px" }}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />

            <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={handleAddPlant}>
              Add Plant
            </Button>
          </Box>
        </Paper>

        {/* Table Section */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "green" }}>
                <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Plant Name</TableCell>
                <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Nickname</TableCell>
                <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Date Added</TableCell>
                <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userPlants.map((plant) => (
                <TableRow key={plant.id}>
                  <TableCell sx={{ fontSize: "1rem" }}>{plant.plant_name}</TableCell>
                  <TableCell sx={{ fontSize: "1rem" }}>{plant.nickname || "N/A"}</TableCell>
                  <TableCell sx={{ fontSize: "1rem" }}>{new Date(plant.date_added).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ display: 'flex', gap: 1 }}>
  {/* Growth Logs Button */}
  <Button
    size="small"
    variant="outlined"
    color="secondary"
  sx={{
    color: 'green', 
    borderColor: 'green', 
    '&:hover': {
      backgroundColor: 'rgba(76, 175, 80, 0.1)', 
    }
  }}
    onClick={() => navigate(`/growth-logs/${plant.id}`)}
  >
    Growth Logs
  </Button>

  {/* Health Monitoring Button */}
  <Button
  size="small"
  variant="outlined"
  color="secondary"
  sx={{
    color: 'green', 
    borderColor: 'green', 
    '&:hover': {
      backgroundColor: 'rgba(76, 175, 80, 0.1)', 
    }
  }}
  onClick={() => navigate(`/health-monitoring/${plant.id}`)}
>
  Health Monitoring
</Button>


  {/* Observations Button */}
  <Button
    size="small"
    variant="outlined"
    color="secondary"
  sx={{
    color: 'green', 
    borderColor: 'green', 
    '&:hover': {
      backgroundColor: 'rgba(76, 175, 80, 0.1)', 
    }
  }}
    onClick={() => navigate(`/observations/${plant.id}`)}
  >
    Observations
  </Button>

  {/* Set Reminder Button */}
  <Button
    size="small"
    variant="outlined"
    color="warning"
    onClick={() => navigate(`/set-reminder/${plant.id}`)}
  >
    Set Reminder
  </Button>

  {/* Delete Icon Button */}
  <IconButton color="error" onClick={() => handleRemovePlant(plant.id)}>
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
  );
};

export default PlantTracking;
