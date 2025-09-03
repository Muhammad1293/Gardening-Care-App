import React, { useState, useEffect } from "react";
import {
  Toolbar, Typography,  Box, 
   Button, Accordion, AccordionSummary, AccordionDetails, Grid, Card, CardContent, CardMedia
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const InteractiveTools = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const symptomOptions = [
  "Yellowing Leaves",
  "Wilting or Drooping",
  "Spots on Leaves",
  "White Powdery Coating",
  "Stunted Growth",
  "Leaf Curling",
  "Black Spots",
];

const diseaseDatabase = [
  {
    name: "Powdery Mildew",
    symptoms: ["White Powdery Coating", "Leaf Curling"],
    solution: "Use a fungicide. Improve air circulation.",
  },
  {
    name: "Root Rot",
    symptoms: ["Wilting or Drooping", "Yellowing Leaves"],
    solution: "Improve drainage. Let soil dry before watering.",
  },
  {
    name: "Leaf Spot",
    symptoms: ["Spots on Leaves", "Black Spots"],
    solution: "Remove affected leaves. Apply organic fungicide.",
  },
];

const [selectedSymptoms, setSelectedSymptoms] = useState([]);
const [diagnosedDiseases, setDiagnosedDiseases] = useState([]);

const toggleSymptom = (symptom) => {
  if (selectedSymptoms.includes(symptom)) {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
  } else {
    setSelectedSymptoms([...selectedSymptoms, symptom]);
  }
};

const handleDiagnosis = () => {
  const matched = diseaseDatabase.filter((disease) =>
    disease.symptoms.some((symptom) => selectedSymptoms.includes(symptom))
  );
  setDiagnosedDiseases(matched);
};


  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);
useEffect(() => {
  const fetchGardenPlan = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:5000/api/garden-planner", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setGardenPlan(response.data); // Assuming response returns array of saved entries
      }
    } catch (error) {
      console.error("Error fetching garden plan:", error.response?.data || error.message);
    }
  };

  if (user) {
    fetchGardenPlan(); // Fetch after user info is loaded
  }
}, [user]);

  const [selectedCategory, setSelectedCategory] = useState("Flowering");
const [identifiedPlants, setIdentifiedPlants] = useState([]);

useEffect(() => {
  const fetchPlants = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/plant-identify/${selectedCategory}`);
      setIdentifiedPlants(response.data);
    } catch (error) {
      console.error("Error fetching plant data:", error);
    }
  };
  fetchPlants();
}, [selectedCategory]);

useEffect(() => {
  const fetchArticles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/articles");
      setArticles(res.data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };
  fetchArticles();
}, []);


const [plants, setPlants] = useState([]);
const [selectedPlant, setSelectedPlant] = useState("");
const [sectionName, setSectionName] = useState("");
const [notes, setNotes] = useState("");
const [gardenPlan, setGardenPlan] = useState([]);
const [articles, setArticles] = useState([]);
const [newArticle, setNewArticle] = useState({ title: "", content: "", imageUrl: "" });
const [openModal, setOpenModal] = useState(false);


const fetchPlantsByCategory = async (category) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/plant-identify/${category}`);
    setPlants(response.data || []);
  } catch (err) {
    console.error("Error fetching plants:", err);
  }
};

const handleAddToPlan = async () => {
  if (!selectedPlant || !sectionName || !user) return;

  const newEntry = {
    user_id: user.user_id,   //  ensure user_id is sent
    section: sectionName,
    plant: selectedPlant,
    notes: notes,
  };

  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      "http://localhost:5000/api/garden-planner",
      newEntry,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 201) {
      setGardenPlan([...gardenPlan, response.data]);
      setSelectedPlant("");
      setSectionName("");
      setNotes("");
    }
  } catch (err) {
    console.error("Error saving garden plan:", err.response?.data || err.message);
  }
};


const handleDeleteEntry = async (index) => {
  const entryToDelete = gardenPlan[index];
  const token = localStorage.getItem("token");

  try {
    const response = await axios.delete(`http://localhost:5000/api/garden-planner/${entryToDelete.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      const updatedPlan = [...gardenPlan];
      updatedPlan.splice(index, 1);
      setGardenPlan(updatedPlan);
    }
  } catch (error) {
    console.error("Error deleting entry:", error.response?.data || error.message);
  }
};

const handleAddArticle = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post("http://localhost:5000/api/articles", {
      title: newArticle.title,
      content: newArticle.content,
      image_url: newArticle.imageUrl
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setArticles([res.data, ...articles]);
    setOpenModal(false);
    setNewArticle({ title: "", content: "", imageUrl: "" });
  } catch (err) {
    console.error("Error adding article:", err);
  }
};

const handleDeleteArticle = async (id) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:5000/api/articles/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setArticles(articles.filter((a) => a.id !== id));
  } catch (err) {
    console.error("Error deleting article:", err);
  }
};

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", backgroundColor: "#E8F5E9" }}>
      {/* NavBar */}
     <Navbar  />

      {/* Space below Navbar */}
      <Toolbar />

      {/* Page Content */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
           Interactive Tools & Resources
        </Typography>

        {/* Section 1: Plant Identification Guide */}
        <Accordion>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Typography variant="h6">🔍 Plant Identification Guide</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <Typography sx={{ mb: 2 }}>
      Select a category to view plants with images and names.
    </Typography>

    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
      {["Flowering", "Vegetable", "Fruit"].map((cat) => (
        <Button
          key={cat}
          variant={selectedCategory === cat ? "contained" : "outlined"}
          color="success"
          onClick={() => setSelectedCategory(cat)}
        >
          {cat}
        </Button>
      ))}
    </Box>

    <Grid container spacing={2}>
      {identifiedPlants.map((plant, index) => (
        <Grid item xs={12} sm={6} md={4} key={plant.id}>
          <Card>
            <CardMedia 
  component="img"
  height="160"
  image={`http://localhost:5000${plant.image_url}`}
  alt={plant.name}
  sx={{ objectFit: "contain" }}
/>

            <CardContent>
              <Typography variant="h6">{plant.name}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </AccordionDetails>
</Accordion>

        {/* Section 2: Garden Planner */}
<Accordion>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Typography variant="h6">🪴 Garden Planner</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <Typography sx={{ mb: 2 }}>
      Create sections and assign plants from categories.
    </Typography>

    {/* Category Selection */}
    <select
      value={selectedCategory}
      onChange={(e) => {
        setSelectedCategory(e.target.value);
        fetchPlantsByCategory(e.target.value);
      }}
      style={{ padding: "8px", width: "100%", marginBottom: "16px" }}
    >
      <option value="">-- Select Category --</option>
      <option value="Flowering">Flowering</option>
      <option value="Vegetable">Vegetable</option>
      <option value="Fruit">Fruit</option>
    </select>

    {/* Plant Dropdown */}
    {plants.length > 0 && (
      <select
        value={selectedPlant}
        onChange={(e) => setSelectedPlant(e.target.value)}
        style={{ padding: "8px", width: "100%", marginBottom: "16px" }}
      >
        <option value="">-- Select Plant --</option>
        {plants.map((plant) => (
          <option key={plant.id} value={plant.name}>{plant.name}</option>
        ))}
      </select>
    )}

    {/* Section and Notes */}
    <input
      type="text"
      placeholder="Section Name (e.g., Front Bed)"
      value={sectionName}
      onChange={(e) => setSectionName(e.target.value)}
      style={{ padding: "8px", width: "100%", marginBottom: "12px" }}
    />
    <textarea
      placeholder="Notes (e.g., Needs watering)"
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      style={{ padding: "8px", width: "100%", marginBottom: "12px", minHeight: "60px" }}
    />
    <Button
      variant="contained"
      color="primary"
      onClick={handleAddToPlan}
      disabled={!selectedPlant || !sectionName}
    >
      Add to Garden Plan
    </Button>

    {/* Display Plan */}
    {gardenPlan.length > 0 && (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">📝 My Garden Plan</Typography>
        <ul style={{ paddingLeft: "1rem" }}>
  {gardenPlan.map((entry, index) => (
    <li key={index} style={{ marginBottom: "12px" }}>
      <strong>Section:</strong> {entry.section}<br />
      <strong>• Plant:</strong> {entry.plant}<br />
      <strong>• Notes:</strong> {entry.notes}<br />
      <Button
        variant="outlined"
        size="small"
        color="error"
        sx={{ mt: 1 }}
        onClick={() => handleDeleteEntry(index)}
      >
        Delete
      </Button>
    </li>
  ))}
</ul>

      </Box>
    )}
  </AccordionDetails>
</Accordion>


        {/* Section 3: Disease Diagnosis Assistant */}
<Accordion>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Typography variant="h6">🦠 Disease Diagnosis Assistant</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <Typography sx={{ mb: 2 }}>
      Select symptoms to identify potential plant diseases.
    </Typography>

    {/* Static Symptom Options */}
    <Box sx={{ mb: 2 }}>
      {symptomOptions.map((symptom) => (
        <Box key={symptom}>
          <label>
            <input
              type="checkbox"
              checked={selectedSymptoms.includes(symptom)}
              onChange={() => toggleSymptom(symptom)}
            />
            &nbsp;{symptom}
          </label>
        </Box>
      ))}
    </Box>

    <Button
      variant="contained"
      color="warning"
      onClick={handleDiagnosis}
      disabled={selectedSymptoms.length === 0}
    >
      Diagnose
    </Button>

    {/* Display Results */}
    {diagnosedDiseases.length > 0 && (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Possible Diseases:
        </Typography>
        {diagnosedDiseases.map((disease, index) => (
          <Card key={index} sx={{ mb: 2, p: 2, backgroundColor: "#fff3e0" }}>
            <Typography variant="h6">🦠 {disease.name}</Typography>
            <Typography sx={{ fontSize: "1rem"}}>💡 {disease.solution}</Typography>
          </Card>
        ))}
      </Box>
    )}
  </AccordionDetails>
</Accordion>


        {/* Section 4: Educational Articles & Tutorials */}
        <Accordion defaultExpanded>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Typography variant="h6">📚 Educational Articles & Tutorials</Typography>
  </AccordionSummary>
  <AccordionDetails>
    {user?.role === "Supervisor" && (
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/articles/new")}
        >
          ➕ Add New Article
        </Button>
      </Box>
    )}

    <Grid container spacing={2}>
      {articles.length === 0 ? (
        <Typography>No articles available.</Typography>
      ) : (
        articles.map((article) => (
          <Grid item xs={12} md={4} key={article.id}>
            <Card>
              <CardMedia
               component="img"
                height="160"
                image={`http://localhost:5000${article.image_url}`}
                 alt={article.title}
                     />

              <CardContent>
                <Typography variant="h6">{article.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {article.content.substring(0, 100)}...
                </Typography>

                <Button
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => navigate(`/articles/${article.id}`)}
                >
                  Read More
                </Button>

                {user?.role === "Supervisor" && (
                  <Button
                    size="small"
                    color="error"
                    sx={{ mt: 1, ml: 1 }}
                    onClick={() => handleDeleteArticle(article.id)}
                  >
                    Delete
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  </AccordionDetails>
</Accordion>
{/* Section: Static Facebook Community Group */}
<Box
  sx={{
    mt: 4,
    p: 3,
    backgroundColor: "#F1F8E9",
    borderRadius: 2,
    border: "1px solid #C5E1A5",
    textAlign: "center",
  }}
>
  <Typography variant="h6" sx={{ mb: 1 }}>
    🌐 Join Our Gardening Community
  </Typography>
  <Typography sx={{ mb: 2 }}>
    Connect with fellow gardeners, homeowners, and plant lovers. Ask questions, share your garden progress, and learn together!
  </Typography>
  <Button
    variant="contained"
    startIcon={
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
        alt="Facebook"
        style={{ width: 24, height: 24 }}
      />
    }
    href="https://www.facebook.com/groups/gardening.pk" // 🔁 Replace with your actual group URL
    target="_blank"
    rel="noopener noreferrer"
    sx={{
      backgroundColor: "#1877F2", // Facebook blue
      color: "#fff",
      "&:hover": {
        backgroundColor: "#145dbf", // darker on hover
      },
    }}
  >
    Join Our Facebook Group
  </Button>
</Box>
{/* Section 5: Recommended Products & Partners */}
<Box sx={{ mt: 4 }}>
  <Typography variant="h6" sx={{ mb: 2 }}>
    🛒 Recommended Products & Partners
  </Typography>

  <Grid container spacing={2}>
    {/* Partner Card 1 */}
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ height: "100%" }}>
        <CardMedia
          component="img"
          height="160"
          image="/images/partner1.jpg"  // Store this image locally or load from URL
          alt="GreenGrow Nursery"
        />
        <CardContent>
          <Typography variant="h6">MTS Gardening</Typography>
          <Typography variant="body2" color="text.secondary">
            Get 15% off on organic fertilizers and garden tools.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 1, backgroundColor: "#4267B2" }}
            fullWidth
            href="https://www.mtsgardening.com/"  // replace with real partner link
            target="_blank"
          >
            Visit Store
          </Button>
        </CardContent>
      </Card>
    </Grid>

    {/* Partner Card 2 */}
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ height: "100%" }}>
        <CardMedia
          component="img"
          height="160"
          image="/images/partner2.jpg"
          alt="GardenBuddy Store"
        />
        <CardContent>
          <Typography variant="h6">Leaf Gardening</Typography>
          <Typography variant="body2" color="text.secondary">
            Premium seeds & pots. Vouchers available for logged-in users.
          </Typography>
          <Button
            variant="contained"
            color="success"
            fullWidth
            sx={{ mt: 1 }}
            href="https://leafgardening.pk/"
            target="_blank"
          >
            Explore Deals
          </Button>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
</Box>


      </Box>
    </Box>
  );
};


export default InteractiveTools;
