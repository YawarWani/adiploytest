require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const fs = require("fs");  // needed to read the CA certificate

const app = express();
app.use(express.json());
app.use(cors());

// MySQL connection pool with CA certificate for Aiven SSL
const pool = mysql.createPool({
  host: process.env.AIVEN_HOST,
  port: process.env.AIVEN_PORT,
  user: process.env.AIVEN_USER,
  password: process.env.AIVEN_PASSWORD,
  database: process.env.AIVEN_DB,
  ssl: {
    ca: fs.readFileSync(__dirname + "/ca.pem")  // path to downloaded Aiven CA certificate
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection at startup
pool.getConnection((err, conn) => {
  if (err) {
    console.error("DB connection failed:", err);
  } else {
    console.log("Connected to Aiven MySQL!");
    conn.release(); // release connection back to pool
  }
});

// POST /save-name — insert a new name
app.post("/save-name", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  const query = "INSERT INTO user (name) VALUES (?)";
  pool.query(query, [name], (err, result) => {
    if (err) {
      console.error("Insert error:", err.sqlMessage || err);
      return res.status(500).json({ error: err.sqlMessage || "Database error" });
    }
    res.json({ message: "Name saved!", id: result.insertId });
  });
});

// GET /get-names — retrieve all names
app.get("/get-names", (req, res) => {
  pool.query("SELECT * FROM user", (err, results) => {
    if (err) {
      console.error("Select error:", err.sqlMessage || err);
      return res.status(500).json({ error: err.sqlMessage || "Database error" });
    }
    res.json(results);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
