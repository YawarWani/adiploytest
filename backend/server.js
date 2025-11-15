const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",      // your MySQL username
  password: "yawar@123",      // your password
  database: "DIPLOY"
});

// API route to save name
app.post("/save-name", (req, res) => {
    console.log("in this route")
  const { name } = req.body;

  const query = "INSERT INTO user (name) VALUES (?)";
  

  db.query(query, [name], (err, result) => {
    if (err) {
        console.log(err)
        return res.status(500).json({ error: err });
    }
console.log(result.insertId)
    res.json({ message: "Name saved!", id: result.insertId });
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
