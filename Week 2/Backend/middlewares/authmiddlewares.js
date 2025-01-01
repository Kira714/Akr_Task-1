const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Access denied, token missing!" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("JWT Error:", err);
            return res.status(401).json({ error: err.name === "TokenExpiredError" ? "Token expired!" : "Invalid token!" });
        }
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;
