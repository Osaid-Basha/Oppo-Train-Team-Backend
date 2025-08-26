const express = require("express");
const userRoutes = require("./userRoutes");
const eventRoutes = require("./eventRoutes");
const authRoutes=require("./authRoute")
const adminRoutes=require("./adminRoute")
const resourceRoutes = require("./resourceRoutes");
const categoryRoutes = require("./categoryRoutes");

const router = express.Router();

router.use("/users", userRoutes);
router.use("/events", eventRoutes);
router.use("/auth",authRoutes);
router.use("/admin",adminRoutes);
router.use("/resources", resourceRoutes);
router.use("/categories", categoryRoutes);
module.exports = router;

