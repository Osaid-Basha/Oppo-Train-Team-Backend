const express = require("express");
const userRoutes = require("./userRoutes");
const eventRoutes = require("./eventRoutes");
const authRoutes=require("./authRoute")
const adminRoutes=require("./adminRoute")

const router = express.Router();

router.use("/users", userRoutes);
router.use("/events", eventRoutes);
router.use("/auth",authRoutes);
router.use("/admin",adminRoutes);
module.exports = router;
