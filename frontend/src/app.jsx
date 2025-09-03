import React from "react";
import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import PersonalizedCare from "./pages/PersonalizedCare";
import PlantTracking from "./pages/PlantTracking";
import SetReminder from "./pages/SetReminder";
import GrowthLogs from "./pages/GrowthLogs";
import HealthMonitoring from "./pages/HealthMonitoring";
import Observations from "./pages/Observations";
import Notifications from "./pages/Notifications";
import InteractiveTools from "./pages/InteractiveTools"; 
import ArticleDetail from "./pages/ArticleDetail";
import AddArticle from "./pages/AddArticle";
import Navbar from "./components/Navbar";





import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

// Theme
const theme = createTheme({
  palette: {
    primary: { main: "#4CAF50" },
    secondary: { main: "#ffffff" },
    background: { default: "#F5F5F5" },
    text: { primary: "#333" },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />

        {/* Pages with sidebar */}
          
        <Route path="/dashboard" element={<><Navbar /><Dashboard /> </> } />
        <Route path="/personalized-care" element={<PersonalizedCare />} />
        <Route path="/plant-tracking" element={<PlantTracking />} />
        <Route path="/set-reminder/:trackingId" element={<SetReminder />} />

        {/* Functional Routes for Tracking Feature */}
        <Route path="/growth-logs/:trackingId" element={<GrowthLogs />} />
        <Route path="/health-monitoring/:trackingId" element={<HealthMonitoring />} />
        <Route path="/observations/:plantId" element={<Observations />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/interactive-tools" element={<InteractiveTools />} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
        <Route path="/articles/new" element={<AddArticle />} />



      </Routes>
    </ThemeProvider>
  );
};

export default App;
