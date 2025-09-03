// routes/articleRoutes.js
import express from "express";
import {
  getArticles,
  getArticle,
  addArticle,
  removeArticle
} from "../controllers/articleController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
const router = express.Router();

router.get("/", getArticles);
router.get("/:id", getArticle);
router.post("/", authMiddleware, upload.single("image"), addArticle);
router.post("/", authMiddleware, addArticle);      
router.delete("/:id", authMiddleware, removeArticle);

export default router;
