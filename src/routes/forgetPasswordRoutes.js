// src/routes/forgetPasswordRoutes.js
const express = require("express");
const { forgotPassword } = require("../controllers/forgetPasswordController");

const router = express.Router();

// endpoint => POST /api/forgot-password
router.post("/forgot-password", forgotPassword);

module.exports = router;
