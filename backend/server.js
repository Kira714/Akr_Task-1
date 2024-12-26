const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

// Middleware
app.use(cors());  // Enable CORS for all origins
app.use(bodyParser.json());  // Parse incoming JSON requests

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost", // Replace with your MySQL server host
    user: "root",      // Replace with your MySQL username
    password: "root",  // Replace with your MySQL password
    database: "test_1" // Replace with your MySQL database name
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL database!");
});

// Create table if not exists
db.query(
    `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstname VARCHAR(50),
        lastname VARCHAR(50),
        email VARCHAR(100) UNIQUE,
        mobile VARCHAR(15),
        gender VARCHAR(10),
        password VARCHAR(100)
    )`,
    (err, result) => {
        if (err) console.error("Error creating table:", err);
    }
);

// API to handle form submission (User Registration)
app.post("/register", (req, res) => {
    const { firstname, lastname, email, mobile, gender, password } = req.body;

    // Validate request data
    if (!firstname || !lastname || !email || !mobile || !gender || !password) {
        return res.status(400).json({ error: "All required fields must be filled!" });
    }

    // Hash the password before saving it
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).json({ error: "Internal server error!" });
        }

        // Insert user into the database with hashed password
        const sql = `INSERT INTO users (firstname, lastname, email, mobile, gender, password) VALUES (?, ?, ?, ?, ?, ?)`;
        db.query(sql, [firstname, lastname, email, mobile, gender, hashedPassword], (err, result) => {
            if (err) {
                console.error("Error inserting user:", err);
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({ error: "Email already exists!" });
                }
                return res.status(500).json({ error: "Database error!" });
            }

            res.status(201).json({ message: "User registered successfully!" });
        });
    });
});

// API to handle user login (with password comparison)
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Validate request data
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required!" });
    }

    // Check if user exists in the database
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error("Error during login:", err);
            return res.status(500).json({ error: "Database error!" });
        }

        if (result.length === 0) {
            return res.status(401).json({ error: "Invalid credentials!" });
        }

        // Compare the entered password with the hashed password in the database
        bcrypt.compare(password, result[0].password, (err, isMatch) => {
            if (err) {
                console.error("Error comparing passwords:", err);
                return res.status(500).json({ error: "Internal server error!" });
            }

            if (!isMatch) {
                return res.status(401).json({ error: "Invalid credentials!" });
            }

            // Passwords match, return successful login
            res.status(200).json({ message: "Login successful!", user: result[0] });
        });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
