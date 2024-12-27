const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// JWT secret key
const JWT_SECRET = "your-secure-jwt-secret"; // Replace with an environment variable in production

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(bodyParser.json()); // Parse incoming JSON requests

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost", // Replace with your MySQL server host
    user: "root", // Replace with your MySQL username
    password: "root", // Replace with your MySQL password
    database: "test_1", // Replace with your MySQL database name
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
    (err) => {
        if (err) console.error("Error creating table:", err);
    }
);

// API to handle user registration
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
        db.query(sql, [firstname, lastname, email, mobile, gender, hashedPassword], (err) => {
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

// API to handle user login with JWT generation
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

            // Generate JWT token
            const token = jwt.sign({ id: result[0].id, email: result[0].email }, JWT_SECRET, { expiresIn: "1h" });

            res.status(200).json({
                message: "Login successful!",
                token,
                user: {
                    id: result[0].id,
                    firstname: result[0].firstname,
                    lastname: result[0].lastname,
                    email: result[0].email,
                },
            });
        });
    });
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ error: "Access denied, token missing!" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Invalid or expired token!" });
        }
        req.user = decoded; // Attach user details from token to the request object
        next();
    });
};

// Protected route to fetch user profile
app.get("/profile", verifyToken, (req, res) => {
    const userId = req.user.id;

    const sql = `SELECT id, firstname, lastname, email, mobile, gender FROM users WHERE id = ?`;
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error("Error fetching user profile:", err);
            return res.status(500).json({ error: "Database error!" });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "User not found!" });
        }

        res.status(200).json({
            message: "User profile fetched successfully!",
            user: result[0],
        });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
