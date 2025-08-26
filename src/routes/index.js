const express = require("express");
const userRoutes = require("./userRoutes");

const forgetPasswordRoutes = require("./forgetPasswordRoutes");

const eventRoutes = require("./eventRoutes");


const router = express.Router();

router.use("/users", userRoutes);
router.use("/events", eventRoutes);

// Forget Password Routes with /auth prefix
router.use("/auth", forgetPasswordRoutes);

module.exports = router;