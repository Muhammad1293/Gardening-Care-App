import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Toolbar,
} from "@mui/material";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import Navbar from "../components/Navbar";

const SetReminder = () => {
  const { trackingId } = useParams();

  const [reminderType, setReminderType] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [frequency, setFrequency] = useState("");
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/reminders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders(response.data);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

 const handleSubmit = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!reminderType || !reminderDate) {
      alert("Please fill in both Reminder Type and Date.");
      return;
    }

    const payload = {
      tracking_id: parseInt(trackingId),
      reminder_type: reminderType,
      reminder_date: reminderDate,
      frequency: frequency || null,
    };

    console.log(" Submitting Reminder:", payload);

    const response = await axios.post(
      "http://localhost:5000/api/reminders/add",
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(" Reminder saved:", response.data);

    alert("Reminder set successfully!");
    setReminderType("");
    setReminderDate("");
    setFrequency("");

    // This must happen AFTER form reset
    fetchReminders();
  } catch (error) {
    console.error(" Reminder submit failed:", error.response?.data || error.message);
    alert("Failed to set reminder.");
  }
};


  const handleDelete = async (reminderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/reminders/remove/${reminderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReminders(reminders.filter((r) => r.id !== reminderId));
    } catch (error) {
      console.error("Error deleting reminder:", error);
      alert("Failed to delete reminder.");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
       {/* NavBar */}
           <Navbar />
      
            {/* Space below Navbar */}
            <Toolbar />
      <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Set Reminder for Plant
        </Typography>

        <TextField
          fullWidth
          label="Reminder Type"
          select
          value={reminderType}
          onChange={(e) => setReminderType(e.target.value)}
          sx={{ my: 2 }}
        >
          <MenuItem value="Watering">Watering</MenuItem>
          <MenuItem value="Pruning">Pruning</MenuItem>
          <MenuItem value="Repotting">Repotting</MenuItem>
        </TextField>

        <TextField
          fullWidth
          type="datetime-local"
          label="Reminder Date & Time"
          InputLabelProps={{ shrink: true }}
          value={reminderDate}
          onChange={(e) => setReminderDate(e.target.value)}
          sx={{ my: 2 }}
        />

        <TextField
          fullWidth
          label="Frequency"
          select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          sx={{ my: 2 }}
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="Daily">Daily</MenuItem>
          <MenuItem value="2 days">Every 2 Days</MenuItem>
          <MenuItem value="3 days">Every 3 Days</MenuItem>
          <MenuItem value="4 days">Every 4 Days</MenuItem>
          <MenuItem value="5 days">Every 5 Days</MenuItem>
          <MenuItem value="Weekly">Weekly</MenuItem>
        </TextField>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Save Reminder
        </Button>
      </Paper>

      {/* Reminder List */}
      <Paper sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h6" gutterBottom>
          Your Reminders
        </Typography>
        {reminders.length === 0 ? (
          <Typography>No reminders found.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: "1rem", fontWeight: "bold"}}>Type</TableCell>
                <TableCell sx={{ fontSize: "1rem", fontWeight: "bold"}}>Date & Time</TableCell>
                <TableCell sx={{ fontSize: "1rem", fontWeight: "bold"}}>Frequency</TableCell>
                <TableCell sx={{ fontSize: "1rem", fontWeight: "bold"}}>Plant</TableCell>
                <TableCell sx={{ fontSize: "1rem", fontWeight: "bold"}}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reminders.map((reminder) => (
                <TableRow key={reminder.id}>
                  <TableCell sx={{ fontSize: "1rem" }}>{reminder.reminder_type}</TableCell>
                  <TableCell sx={{ fontSize: "1rem" }}>
  {new Date(reminder.reminder_date).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })}
</TableCell>

                  <TableCell sx={{ fontSize: "1rem" }}>{reminder.frequency || "One-time"}</TableCell>
                  <TableCell sx={{ fontSize: "1rem" }}>{reminder.plant_name}</TableCell>
                  <TableCell sx={{ fontSize: "1rem" }}>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(reminder.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

export default SetReminder;
