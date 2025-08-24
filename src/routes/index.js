const express = require("express");
const userRoutes = require("./userRoutes");
const eventRoutes = require("./eventRoutes");

const router = express.Router();

router.use("/users", userRoutes);
router.use("/events", eventRoutes);

module.exports = router;
