// controllers/articleController.js
import {
  getAllArticles,
  getArticleById,
  createArticle,
  deleteArticle
} from "../models/articleModel.js";

export const getArticles = async (req, res) => {
  try {
    const articles = await getAllArticles();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch articles" });
  }
};

export const getArticle = async (req, res) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) return res.status(404).json({ error: "Not found" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: "Error fetching article" });
  }
};

export const addArticle = async (req, res) => {
  try {
    const { title, content } = req.body;

    // If file is uploaded, use its path
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;

    const newArticle = await createArticle(title, content, image_url);
    res.status(201).json(newArticle);
  } catch (err) {
    console.error("Add article error:", err);
    res.status(500).json({ error: "Failed to add article" });
  }
};

export const removeArticle = async (req, res) => {
  try {
    await deleteArticle(req.params.id);
    res.json({ message: "Article deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete article" });
  }
};
