const express = require("express");
const userRoutes = require("./userRoutes");

const router = express.Router();

// Users routes
router.use("/users", userRoutes);

module.exports = router;
