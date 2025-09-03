import React, { useState, useEffect, useContext } from "react";
import {
  Container, Paper, Typography, TextField, Button, MenuItem,
  Box, Checkbox, FormControlLabel, Autocomplete, IconButton, Snackbar
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

// Predefined Lists
const roles = ["Gardener", "Supervisor", "Homeowner"];
const gardeningOptions = ["Flower Gardening", "Vegetable Gardening", "Fruit Gardening"];
const climateOptions = ["Tropical", "Temperate", "Arid", "Mediterranean", "Subtropical", "Continental", "Polar", "Cool", "Warm"];
const soilTypeOptions = ["Loamy", "Sandy", "Clay", "Silty", "Peaty", "Chalky", "Saline"];
const locations = [ "Islamabad", "Lahore", "Karachi", "Peshawar", "Quetta", "Multan", "Rawalpindi", "Faisalabad", "Sialkot", "Gujranwala",
  "New Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Pune", "Jaipur", "Lucknow",
  "Dubai", "Abu Dhabi", "Riyadh", "Jeddah", "Doha", "Kuwait City", "Muscat", "Manama", "Baghdad", "Tehran",
  "Dhaka", "Kathmandu", "Colombo", "Male", "Thimphu", "Jakarta", "Kuala Lumpur", "Singapore", "Bangkok", "Hanoi",
  "Manila", "Yangon", "Tokyo", "Seoul", "Beijing", "Shanghai", "Hong Kong", "Taipei", "London", "Paris",
  "Berlin", "Madrid", "Rome", "Amsterdam", "Brussels", "Vienna", "Stockholm", "New York", "Los Angeles",
  "Chicago", "Houston", "Miami", "Toronto", "Vancouver", "Sydney", "Melbourne"
];

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: "", email: "", role: "", location: "",
    climate: "", soil_type: "", gardening_preferences: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const { setUser } = useContext(UserContext);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profile = res.data;
        if (!Array.isArray(profile.gardening_preferences)) {
          profile.gardening_preferences = [];
        }

        setUserData(profile);
        setOriginalData(profile); // Save for cancel
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (_, newValue) => {
    setUserData((prev) => ({ ...prev, location: newValue }));
  };

  const handleCheckboxChange = (e) => {
    const value = e.target.name;
    setUserData((prev) => ({
      ...prev,
      gardening_preferences: prev.gardening_preferences.includes(value)
        ? prev.gardening_preferences.filter((item) => item !== value)
        : [...prev.gardening_preferences, value],
    }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(userData.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/users/profile", userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userData);
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      
      // Redirect after short delay to show snackbar
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
      
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  

  const handleCancel = () => {
    setUserData(originalData);
    setIsEditing(false);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, textAlign: "center", marginTop: 6, backgroundColor: "#f9fff3" }}>
        
        {/* Back Button + Heading */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left", gap: 1, marginBottom: 2 }}>
          <IconButton onClick={() => navigate(-1)} color="success">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Profile Details
          </Typography>
        </Box>

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <TextField fullWidth label="Username" name="username" value={userData.username} onChange={handleChange} variant="outlined" margin="normal" disabled={!isEditing} />
          <TextField fullWidth label="Email" name="email" type="email" value={userData.email} onChange={handleChange} variant="outlined" margin="normal" disabled={!isEditing} />
          <TextField fullWidth select label="Role" name="role" value={userData.role} onChange={handleChange} variant="outlined" margin="normal" disabled={!isEditing}>
            {roles.map((role) => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </TextField>

          <Autocomplete
            options={locations}
            value={userData.location}
            onChange={handleLocationChange}
            disabled={!isEditing}
            renderInput={(params) => (
              <TextField {...params} label="Search & Select Location" variant="outlined" margin="normal" fullWidth />
            )}
          />

          <TextField fullWidth select label="Climate" name="climate" value={userData.climate} onChange={handleChange} variant="outlined" margin="normal" disabled={!isEditing}>
            {climateOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          <TextField fullWidth select label="Soil Type" name="soil_type" value={userData.soil_type} onChange={handleChange} variant="outlined" margin="normal" disabled={!isEditing}>
            {soilTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          <Typography variant="subtitle1" sx={{ textAlign: "left", marginTop: 2 }}>
            Gardening Preferences:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
            {gardeningOptions.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={userData.gardening_preferences.includes(option)}
                    onChange={handleCheckboxChange}
                    name={option}
                    disabled={!isEditing}
                  />
                }
                label={option}
              />
            ))}
          </Box>

          {isEditing ? (
            <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
              <Button type="submit" variant="contained" color="success" fullWidth>Save</Button>
              <Button onClick={handleCancel} variant="outlined" fullWidth>Cancel</Button>
            </Box>
          ) : (
            <Button variant="contained" onClick={() => setIsEditing(true)} fullWidth sx={{ marginTop: 2 }}>
              Edit Profile
            </Button>
          )}
        </form>
      </Paper>

      {/* Snackbar Success Toast */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert elevation={6} variant="filled" severity="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
