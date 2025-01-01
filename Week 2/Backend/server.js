const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cluster = require("cluster");
const os = require("os");
require("dotenv").config();
const logger = require("./middlewares/logger");

const app = express();
const numCPUs = os.cpus().length;
const verifyToken = require("./middlewares/authmiddlewares");

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(logger);

// Routes
const authRoutes = require("./routes/authroutes");
app.use("/api/auth", authRoutes);

// Cluster Implementation
if (cluster.isPrimary) {
    console.log(`Primary cluster running on process ${process.pid}`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });
} else {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server running on process ${process.pid} at http://localhost:${process.env.PORT || 3000}`);
    });
}

app.post("/home", verifyToken, (req, res) => {
    res.status(200).json({ message: "Access granted to profile route!", user: req.user });
})
