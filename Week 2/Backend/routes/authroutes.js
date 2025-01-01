const express = require("express");
const { register, login } = require("../controllers/authController");
const verifyToken = require("../middlewares/authmiddlewares");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/home", verifyToken, (req, res) => {
    res.status(200).json({ message: "Access granted to protected route!", user: req.user });
});

module.exports = router;
