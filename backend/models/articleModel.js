// models/articleModel.js
import pool from "../config/db.js"; //


export const getAllArticles = async () => {
  const result = await pool.query("SELECT * FROM articles ORDER BY created_at DESC");
  return result.rows;
};

export const getArticleById = async (id) => {
  const result = await pool.query("SELECT * FROM articles WHERE id = $1", [id]);
  return result.rows[0];
};

export const createArticle = async (title, content, image_url) => {
  const result = await pool.query(
    "INSERT INTO articles (title, content, image_url) VALUES ($1, $2, $3) RETURNING *",
    [title, content, image_url]
  );
  return result.rows[0];
};

export const deleteArticle = async (id) => {
  await pool.query("DELETE FROM articles WHERE id = $1", [id]);
};
