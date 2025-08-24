require("dotenv").config();
const express = require("express");
const routes = require("./routes");

const app = express();
app.use(express.json());

// Routes
app.use("/api", routes);

// Route 
app.get("/", (req, res) => {
  res.send("Server is running and connected!");
});

module.exports = app;
