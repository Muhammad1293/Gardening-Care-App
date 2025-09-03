import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Create PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Test database connection
pool.connect()
  .then(client => {
    console.log(" Database connected successfully!");
    client.release();
  })
  .catch(err => {
    console.error(" Database connection error:", err.message);
  });

export default pool;
