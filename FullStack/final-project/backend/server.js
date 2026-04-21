import express from "express";
import cors from "cors";
import pool from "./db.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Needed in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function ensureFeedbackSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      train_number TEXT,
      name TEXT NOT NULL,
      phone_number TEXT,
      email TEXT NOT NULL,
      issue_type TEXT NOT NULL,
      location TEXT,
      subscribe BOOLEAN NOT NULL DEFAULT FALSE,
      contact_method TEXT NOT NULL,
      description TEXT,
      submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);
}

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running successfully 🚀" });
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.get("/api/feedback", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, train_number AS "trainNumber", name, phone_number AS "phoneNumber", email, issue_type AS "issueType", location, subscribe, contact_method AS "contactMethod", description, to_char(submitted_at, 'YYYY-MM-DD HH24:MI') AS "submittedAt" FROM feedback ORDER BY submitted_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Feedback query failed:", error);
    res.status(500).json({ error: "Feedback query failed" });
  }
});

app.post("/api/feedback", async (req, res) => {
  try {
    const {
      trainNumber,
      name,
      phoneNumber,
      email,
      issueType,
      location,
      subscribe,
      contactMethod,
      description,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO feedback (train_number, name, phone_number, email, issue_type, location, subscribe, contact_method, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, train_number AS trainNumber, name, phone_number AS phoneNumber, email, issue_type AS issueType, location, subscribe, contact_method AS contactMethod, description, submitted_at AS submittedAt`,
      [
        trainNumber || null,
        name,
        phoneNumber || null,
        email,
        issueType,
        location || null,
        subscribe,
        contactMethod,
        description || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Feedback insert failed:", error);
    res.status(500).json({ error: "Feedback insert failed" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email",
      [name, email]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Insert failed:", error);
    res.status(500).json({ error: "Insert failed" });
  }
});

ensureFeedbackSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to ensure feedback schema:", err);
    process.exit(1);
  });