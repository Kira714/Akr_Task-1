const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../utils/encrypt");
const { createUser, findUserByEmail } = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
    const { firstname, lastname, email, mobile, gender, password } = req.body;

    if (!firstname || !lastname || !email || !mobile || !gender || !password) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    try {
        const hashedPassword = await hashPassword(password);
        createUser({ firstname, lastname, email, mobile, gender, password: hashedPassword }, (err) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({ error: "Email already exists!" });
                }
                return res.status(500).json({ error: "Database error!" });
            }
            res.status(201).json({ message: "User registered successfully!" });
        });
    } catch (err) {
        res.status(500).json({ error: "Internal server error!" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required!" });
    }

    findUserByEmail(email, async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error!" });
        if (results.length === 0) return res.status(401).json({ error: "Invalid credentials!" });

        const user = results[0];

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials!" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });

        res.status(200).json({ message: "Login successful!", token });
    });
};

module.exports = { register, login };
