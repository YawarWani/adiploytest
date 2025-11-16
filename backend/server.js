const express = require("express");
const mysql = require("mysql2");  // use mysql2 for SSL support
const cors = require("cors");
require("dotenv").config();       // to load environment variables

const app = express();
app.use(express.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.AIVEN_HOST,
  port: process.env.AIVEN_PORT,
  user: process.env.AIVEN_USER,
  password: process.env.AIVEN_PASSWORD,
  database: process.env.AIVEN_DB,
  ssl: {
    rejectUnauthorized: true  // Aiven requires SSL
  }
});

// Connect to DB
db.connect(err => {
  if (err) {
    console.error("Error connecting to Aiven MySQL:", err);
  } else {
    console.log("Connected to Aiven MySQL!");
  }
});

// API route to save name
app.post("/save-name", (req, res) => {
  const { name } = req.body;

  const query = "INSERT INTO user (name) VALUES (?)";

  db.query(query, [name], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Name saved!", id: result.insertId });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
