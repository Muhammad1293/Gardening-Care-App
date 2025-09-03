import React, { useState, useEffect } from "react";
import {
  Toolbar, Typography, Box, Paper, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, FormControl, InputLabel, Select, MenuItem,
  IconButton, Button
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom"; //  Added useParams
import Navbar from "../components/Navbar";;

const Observations = () => {
  const { plantId } = useParams(); //  Read from URL
  const [trackedPlants, setTrackedPlants] = useState([]);
  const [observations, setObservations] = useState([]);
  const [selectedTrackingId, setSelectedTrackingId] = useState("");
  const [note, setNote] = useState("");
  const [recordedAt, setRecordedAt] = useState("");
  const [observationType, setObservationType] = useState("");

  useEffect(() => {
    fetchTrackedPlants();
  }, []);

  const fetchTrackedPlants = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/plant-tracking", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrackedPlants(response.data);

      //  Match route param with plant ID and pre-select it
      const matchedPlant = response.data.find(p => String(p.id) === plantId);
      if (matchedPlant) {
        setSelectedTrackingId(matchedPlant.id);
        fetchObservations(matchedPlant.id);
      } else if (response.data.length > 0) {
        const firstPlantId = response.data[0].id;
        setSelectedTrackingId(firstPlantId);
        fetchObservations(firstPlantId);
      }
    } catch (error) {
      console.error("Error fetching tracked plants:", error);
    }
  };

  const fetchObservations = async (trackingId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/observations/${trackingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setObservations(response.data);
    } catch (error) {
      console.error("Error fetching observations:", error);
    }
  };

  const handleAddObservation = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!selectedTrackingId || !note.trim() || !recordedAt || !observationType) {
        alert("Please fill in all fields");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/observations/add",
        {
          tracking_id: selectedTrackingId,
          note,
          observation_type: observationType,
          recorded_at: recordedAt
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setObservations([...observations, response.data]);
      setNote("");
      setRecordedAt("");
      setObservationType("");
    } catch (error) {
      console.error("Error adding observation:", error);
    }
  };

  const handleRemoveObservation = async (observationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/observations/remove/${observationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setObservations(observations.filter((obs) => obs.id !== observationId));
    } catch (error) {
      console.error("Error removing observation:", error);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#E8F5E9" }}>
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
         {/* NavBar */}
     <Navbar />

      {/* Space below Navbar */}
      <Toolbar />
        <Box sx={{ padding: 3 }}>
          <Paper sx={{ padding: 3, backgroundColor: "#FFFFFF", marginBottom: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>📋 Add Plant Observation</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginTop: 2, flexWrap: "wrap" }}>
              <FormControl sx={{ minWidth: "200px" }}>
                <InputLabel>Select Plant</InputLabel>
                <Select
                  value={selectedTrackingId}
                  onChange={(e) => {
                    setSelectedTrackingId(e.target.value);
                    fetchObservations(e.target.value);
                  }}
                >
                  <MenuItem value="">Choose a Tracked Plant</MenuItem>
                  {trackedPlants.map((plant) => (
                    <MenuItem key={plant.id} value={plant.id}>
                      {plant.nickname || plant.plant_name || `Plant ${plant.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: "180px" }}>
                <InputLabel>Observation Type</InputLabel>
                <Select
                  value={observationType}
                  onChange={(e) => setObservationType(e.target.value)}
                >
                  <MenuItem value="">Select Type</MenuItem>
                  <MenuItem value="Growth">Growth</MenuItem>
                  <MenuItem value="Flowering">Flowering</MenuItem>
                  <MenuItem value="Pest Attack">Pest Attack</MenuItem>
                  <MenuItem value="Leaf Color Change">Leaf Color Change</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Observation Note"
                variant="outlined"
                sx={{ minWidth: "250px" }}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <TextField
                label="Date"
                type="date"
                variant="outlined"
                sx={{ minWidth: "200px" }}
                value={recordedAt}
                onChange={(e) => setRecordedAt(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={handleAddObservation}>
                Add Observation
              </Button>
            </Box>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "green" }}>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Note</TableCell>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Type</TableCell>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Date</TableCell>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {observations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No observations yet.</TableCell>
                  </TableRow>
                ) : (
                  observations.map((obs) => (
                    <TableRow key={obs.id}>
                      <TableCell sx={{ fontSize: "1rem" }}>{obs.note}</TableCell>
                      <TableCell sx={{ fontSize: "1rem" }}>{obs.observation_type}</TableCell>
                      <TableCell sx={{ fontSize: "1rem" }}>{new Date(obs.recorded_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => handleRemoveObservation(obs.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default Observations;
