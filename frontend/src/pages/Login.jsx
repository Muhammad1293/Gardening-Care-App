import React, { useState, useContext } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  Box,
  Alert,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState(""); // Error state for login failure
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage(""); // Reset error message

  try {
    // 1. Login API
    const response = await axios.post("http://localhost:5000/api/auth/login", formData);

    // 2. Save token in localStorage
    localStorage.setItem("token", response.data.token);

    // 3. Fetch user profile using token
    const profileRes = await axios.get("http://localhost:5000/api/users/profile", {
      headers: {
        Authorization: `Bearer ${response.data.token}`,
      },
    });

    // 4. Set user in context
    setUser(profileRes.data);

    // 5. Navigate to dashboard
    navigate("/dashboard");
  } catch (error) {
    console.error("Login failed", error);
    setErrorMessage("Incorrect email or password. Please try again.");
  }
};


  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{ padding: 4, textAlign: "center", marginTop: 6, backgroundColor: "#f9fff3" }}
      >
        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
          Gardening Care - Login
        </Typography>

        {/* Display error message if login fails */}
        {errorMessage && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            margin="normal"
            onChange={handleChange}
            required
          />

          {/* Password field with show/hide toggle */}
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel htmlFor="login-password">Password</InputLabel>
            <OutlinedInput
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              label="Password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>

          <Button type="submit" variant="contained" color="success" fullWidth sx={{ marginTop: 2 }}>
            Login
          </Button>
        </form>

        <Box sx={{ marginTop: 2 }}>
          <Typography variant="body2">Don't have an account?</Typography>
          <Button onClick={() => navigate("/")} color="primary">
            Register here
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
