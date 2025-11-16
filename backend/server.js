require("dotenv").config();
const express = require("express");
const mysql = require("mysql2"); // mysql2 supports SSL better
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Create a connection pool for Aiven MySQL
const pool = mysql.createPool({
  host: process.env.AIVEN_HOST,
  port: process.env.AIVEN_PORT,
  user: process.env.AIVEN_USER,
  password: process.env.AIVEN_PASSWORD,
  database: process.env.AIVEN_DB,
  ssl: {
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection at startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to Aiven MySQL:", err);
  } else {
    console.log("Connected to Aiven MySQL!");
    connection.release();
  }
});

// POST /save-name — save a name
app.post("/save-name", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  const query = "INSERT INTO user (name) VALUES (?)";
  pool.query(query, [name], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Name saved!", id: result.insertId });
  });
});

// GET /get-names — retrieve all saved names
app.get("/get-names", (req, res) => {
  pool.query("SELECT * FROM user", (err, results) => {
    if (err) {
      console.error("Select error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
