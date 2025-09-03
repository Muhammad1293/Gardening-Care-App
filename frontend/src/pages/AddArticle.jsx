// AddArticle.jsx
import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Toolbar,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";


const AddArticle = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null); // for file upload

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);

      await axios.post("http://localhost:5000/api/articles", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/interactive-tools");
    } catch (err) {
      console.error("Error adding article:", err);
    }
  };

  return (
    
    <Container maxWidth="md" sx={{ mt: 4 }}>
       {/* NavBar */}
           <Navbar />
      
            {/* Space below Navbar */}
            <Toolbar />
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          ➕ Add New Article
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Title"
            fullWidth
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button variant="outlined" component="label" sx={{ mb: 2 }}>
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </Button>
          {image && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Selected: {image.name}
            </Typography>
          )}

          <TextField
            label="Content"
            fullWidth
            required
            multiline
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button type="submit" variant="contained" color="primary">
            Submit Article
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddArticle;
