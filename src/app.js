require("dotenv").config();
const express = require("express");
const path = require("path");
const routes = require("./routes");

const app = express();

// Middleware
app.use(express.json());

// Serve static files (images in uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", routes);

// Default route
app.get("/", (req, res) => {
  res.send("Server is running and connected!");
});

module.exports = app;
