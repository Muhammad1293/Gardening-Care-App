import React, { useState, useEffect } from "react";
import {
  Toolbar, Typography, Box, Paper, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, FormControl, InputLabel, Select, MenuItem,
  IconButton,  Button, Dialog, DialogTitle, DialogContent
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const GrowthLogs = () => {
  const navigate = useNavigate();
  const { trackingId } = useParams();
  const [trackedPlants, setTrackedPlants] = useState([]);
  const [growthLogs, setGrowthLogs] = useState([]);
  const [selectedTrackingId, setSelectedTrackingId] = useState("");
  const [height, setHeight] = useState("");
  const [growthStage, setGrowthStage] = useState("");
  const [observationDate, setObservationDate] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // for modal
  const [fileName, setFileName] = useState(""); // show selected file name

  useEffect(() => {
    fetchTrackedPlants();
  }, []);

  useEffect(() => {
    if (trackingId) {
      setSelectedTrackingId(trackingId);
      fetchGrowthLogs(trackingId);
    }
  }, [trackingId]);

  const fetchTrackedPlants = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/growth-logs/tracked", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrackedPlants(response.data);
    } catch (error) {
      console.error("Error fetching tracked plants:", error);
    }
  };

  const fetchGrowthLogs = async (trackingId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/growth-logs/${trackingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGrowthLogs(response.data);
    } catch (error) {
      console.error("Error fetching growth logs:", error);
    }
  };

  const handleAddGrowthLog = async () => {
    if (!selectedTrackingId || !height || !growthStage || !observationDate) return;

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("tracking_id", selectedTrackingId);
      formData.append("height_cm", height);
      formData.append("growth_stage", growthStage);
      formData.append("observation_date", observationDate);
      if (image) formData.append("image", image);

      await axios.post("http://localhost:5000/api/growth-logs/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      fetchGrowthLogs(selectedTrackingId);
      setHeight("");
      setGrowthStage("");
      setObservationDate("");
      setImage(null);
      setFileName("");
    } catch (error) {
      console.error("Error adding growth log:", error);
    }
  };

  const handleRemoveGrowthLog = async (logId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/growth-logs/remove/${logId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGrowthLogs(growthLogs.filter((log) => log.id !== logId));
    } catch (error) {
      console.error("Error removing growth log:", error);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#E8F5E9" }}>
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        
         {/* NavBar */}
     <Navbar />

      {/* Space below Navbar */}
      <Toolbar />

        <Box sx={{ p: 3 }}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Add Growth Log</Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Select Plant</InputLabel>
                <Select
                  value={selectedTrackingId}
                  onChange={(e) => {
                    setSelectedTrackingId(e.target.value);
                    fetchGrowthLogs(e.target.value);
                  }}
                  label="Select Plant"
                >
                  <MenuItem value="">Choose a Tracked Plant</MenuItem>
                  {trackedPlants.map((plant) => (
                    <MenuItem key={plant.id} value={plant.id}>
                      {plant.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Height (cm)"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                sx={{ minWidth: 150 }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Growth Stage</InputLabel>
                <Select
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value)}
                  label="Growth Stage"
                >
                  <MenuItem value="Seedling">Seedling</MenuItem>
                  <MenuItem value="Vegetative">Vegetative</MenuItem>
                  <MenuItem value="Budding">Budding</MenuItem>
                  <MenuItem value="Flowering">Flowering</MenuItem>
                  <MenuItem value="Fruiting">Fruiting</MenuItem>
                  <MenuItem value="Mature">Mature</MenuItem>
                </Select>
              </FormControl>

              <TextField
                type="date"
                value={observationDate}
                onChange={(e) => setObservationDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 180 }}
              />
              <Button variant="contained" component="label" color="secondary">
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    setImage(e.target.files[0]);
                    setFileName(e.target.files[0]?.name || "");
                  }}
                />
              </Button>
              {fileName && <Typography variant="body2">{fileName}</Typography>}

              <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={handleAddGrowthLog}>
                Add Log
              </Button>
            </Box>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "green" }}>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Plant</TableCell>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Height</TableCell>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Stage</TableCell>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Date</TableCell>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Image</TableCell>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {growthLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell sx={{ fontSize: "1rem" }}>{log.plant_name || "-"}</TableCell>
                    <TableCell sx={{ fontSize: "1rem" }}>{log.height_cm}</TableCell>
                    <TableCell sx={{ fontSize: "1rem" }}>{log.growth_stage}</TableCell>
                    <TableCell sx={{ fontSize: "1rem" }}>{log.logged_at ? new Date(log.logged_at).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      {log.image_url ? (
                        <img
                          src={`http://localhost:5000${log.image_url}`}
                          alt="Growth"
                          width="60"
                          style={{ cursor: "pointer", borderRadius: "4px" }}
                          onClick={() => setPreviewImage(`http://localhost:5000${log.image_url}`)}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleRemoveGrowthLog(log.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Preview Modal */}
        <Dialog open={Boolean(previewImage)} onClose={() => setPreviewImage(null)} maxWidth="md">
          <DialogTitle>
            Image Preview
            <IconButton
              onClick={() => setPreviewImage(null)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
              />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
};

export default GrowthLogs;
