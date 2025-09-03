// src/components/Navbar.jsx
import React, { useState, useContext } from "react";
import {
  AppBar, Toolbar, Typography, IconButton, Box, Menu, MenuItem, Avatar, Button, Badge
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import SpaIcon from "@mui/icons-material/Spa";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/ExitToApp";
import { UserContext } from "../context/UserContext";

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    await logout(); // call logout from context
    handleMenuClose();
    navigate("/login"); // redirect after logout
  };

  const navItems = [
    { label: "Search Plants", path: "/dashboard", icon: <LocalFloristIcon /> },
    { label: "Personalized Care", path: "/personalized-care", icon: <SpaIcon /> },
    { label: "Plant Tracking", path: "/plant-tracking", icon: <TrackChangesIcon /> },
    { label: "Tools & Resources", path: "/interactive-tools", icon: <LibraryBooksIcon /> },
  ];

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "green" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* App title */}
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "white" }}>
          Gardening Care App
        </Typography>

        {/* Nav links */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {navItems.map(({ label, path, icon }) => (
            <Button
              key={path}
              color="inherit"
              startIcon={icon}
              onClick={() => navigate(path)}
              sx={{
                color: location.pathname === path ? "#FFD700" : "white",
                fontSize: "1rem",
                fontWeight: location.pathname === path ? "bold" : "normal",
              }}
            >
              {label}
            </Button>
          ))}
        </Box>

        {/* Right side: notifications + profile */}
        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Notifications */}
            <IconButton onClick={() => navigate("/notifications")} sx={{ color: "white" }}>
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* User menu */}
            <Box 
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }} 
              onClick={handleMenuClick}
            >
              <Avatar sx={{ bgcolor: "#ffffff", color: "green", width: 40, height: 40 }}>
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </Avatar>

              {/* Username + Role */}
              <Box display="flex" flexDirection="column" alignItems="center" sx={{ ml: 1 }}>
                <Typography sx={{ color: "white", fontWeight: "bold" }}>
                  {user.username}
                </Typography>
                <Typography sx={{ color: "white", fontSize: "0.8rem", lineHeight: 1 }}>
                  {user.role || "User"}
                </Typography>
              </Box>
            </Box>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={() => { handleMenuClose(); navigate("/profile"); }}>My Profile</MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
