import React, { useState, useEffect } from "react";
import {
Toolbar, Typography, Box, Paper, TextField, MenuItem, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, FormControl, InputLabel, Select,
  Button
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import AddIcon from "@mui/icons-material/Add";
import Navbar from "../components/Navbar";

import axios from "axios";

const Dashboard = () => {
  const [plants, setPlants] = useState([]);
  const [search, setSearch] = useState({ name: "", category: "", soil_type: "", climate: "" });
  const [openDialog, setOpenDialog] = useState(false);
const [selectedPlantId, setSelectedPlantId] = useState(null);
const [nicknameInput, setNicknameInput] = useState("");

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/plants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlants(response.data);
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
  };

  const handleOpenDialog = (plantId) => {
  setSelectedPlantId(plantId);
  setNicknameInput("");
  setOpenDialog(true);
};

const handleCloseDialog = () => {
  setOpenDialog(false);
};

const handleAddPlantWithNickname = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.post(
      "http://localhost:5000/api/plant-tracking/add",
      { plant_id: selectedPlantId, nickname: nicknameInput },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert(" Plant added to your tracking list!");
    handleCloseDialog();
  } catch (error) {
    console.error("Error adding plant:", error);
    alert(" Failed to add plant. Maybe it's already tracked.");
  }
};

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/plants/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: search,
      });
      setPlants(response.data);
    } catch (error) {
      console.error("Error searching plants:", error);
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100vh", backgroundColor: "#E8F5E9" }}>
      
      {/* NavBar */}
     <Navbar />

      {/* Space below Navbar */}
      <Toolbar />

      {/* Search Section */}
      <Box sx={{ padding: 3 }}>
        <Paper sx={{ padding: 3 }}>
          <Typography variant="h6" fontWeight="bold"> Search for Plants</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginTop: 2, flexWrap: "wrap" }}>
            <TextField
              label="Plant Name"
              variant="outlined"
              size="small"
              sx={{ minWidth: "250px" }}
              placeholder="Enter plant name"
              value={search.name}
              onChange={(e) => setSearch({ ...search, name: e.target.value })}
            />

            {[
              { label: "Category", field: "category", options: ["Flowering", "Vegetable", "Fruit"] },
              { label: "Soil Type", field: "soil_type", options: ["Loamy", "Sandy", "Clay", "Silty", "Peaty", "Chalky", "Saline"] },
              { label: "Climate", field: "climate", options: ["Tropical", "Temperate", "Arid", "Mediterranean", "Subtropical", "Continental", "Polar", "Cool", "Warm"] }
            ].map(({ label, field, options }) => (
              <FormControl key={field} size="small" sx={{ minWidth: "150px" }}>
                <InputLabel>{label}</InputLabel>
                <Select
                  value={search[field]}
                  onChange={(e) => setSearch({ ...search, [field]: e.target.value })}
                >
                  <MenuItem value="">Any {label}</MenuItem>
                  {options.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}

            <Button variant="contained" color="success" startIcon={<SearchIcon />} onClick={handleSearch}>
              Search
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Results Table */}
      <Box sx={{ padding: 3 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "green" }}>
                {["Name", "Category", "Soil Type", "Climate", "Care Instructions", "Action"].map((col) => (
                  <TableCell key={col} sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {plants.length > 0 ? plants.map((plant) => (
                <TableRow key={plant.id}>
                  <TableCell sx={{ fontSize: "1rem" }}>{plant.name}</TableCell>
                  <TableCell sx={{ fontSize: "1rem" }}>{plant.category}</TableCell>
                  <TableCell sx={{ fontSize: "1rem" }}>{plant.soil_type}</TableCell>
                  <TableCell sx={{ fontSize: "1rem" }}>{plant.climate}</TableCell>
                  <TableCell sx={{ fontSize: "1rem" }}>{plant.care_instructions}</TableCell>
                  <TableCell>
                  <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog(plant.id)}
                       >
                      Add to My Plants
                  </Button>
                 </TableCell>

                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} sx={{ textAlign: "center" }}>No plants found </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
  <DialogTitle>Add Plant to Tracking</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="Nickname (Optional)"
      fullWidth
      value={nicknameInput}
      onChange={(e) => setNicknameInput(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
    <Button onClick={handleAddPlantWithNickname} variant="contained" color="success">
      Add
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
};

export default Dashboard;