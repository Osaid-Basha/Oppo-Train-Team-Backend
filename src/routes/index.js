const express = require("express");
const userRoutes = require("./userRoutes");
const forgetPasswordRoutes = require("./forgetPasswordRoutes");

const router = express.Router();

// Users routes
router.use("/users", userRoutes);

// Forget Password Routes with /auth prefix
router.use("/auth", forgetPasswordRoutes);

module.exports = router;