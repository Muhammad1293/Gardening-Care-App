import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Button,
} from "@mui/material";
import axios from "axios";
import Navbar from "../components/Navbar";

const Notifications = () => {
  const [reminders, setReminders] = useState([]);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetchDueReminders();
    fetchWeather();
  }, []);

  const fetchDueReminders = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:5000/api/reminders/due", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setReminders(response.data);
  };

  const fetchWeather = async () => {
    const token = localStorage.getItem("token");
    const userRes = await axios.get("http://localhost:5000/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const location = userRes.data.location;

    const apiKey = "6740acf162da2e3f724e19a1b9ec86cd"; // Replace with real key
    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`
    );
    setWeather(weatherRes.data);
  };

  const handleMarkAsDone = async (reminderId) => {
  const token = localStorage.getItem("token");
  try {
    await axios.patch(`http://localhost:5000/api/reminders/mark-done/${reminderId}`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Refresh the list
    fetchDueReminders();
  } catch (error) {
    console.error("Error marking reminder as done:", error);
  }
};


  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#E8F5E9" }}>
       {/* NavBar */}
     <Navbar />

      {/* Space below Navbar */}
      <Toolbar />

      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6">⏰ Due Reminders</Typography>
          {reminders.length === 0 ? (
            <Typography>No reminders due right now.</Typography>
          ) : (
            <List>
  {reminders.map((reminder) => (
    <ListItem
      key={reminder.id}
      secondaryAction={
        <Button
          variant="outlined"
          color="success"
          onClick={() => handleMarkAsDone(reminder.id)}
        >
          Mark as Done
        </Button>
      }
    >
      <ListItemText 
        primary={`${reminder.plant_name} - ${reminder.reminder_type}`}
        secondary={`Scheduled: ${new Date(reminder.reminder_date).toLocaleString()}`}
      />
    </ListItem>
  ))}
</List>

          )}
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">🌤 Weather Update</Typography>
          {weather ? (
            <Typography>
              {weather.name}: {weather.weather[0].description}, {weather.main.temp}°C
            </Typography>
          ) : (
            <Typography>Loading weather...</Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Notifications;
