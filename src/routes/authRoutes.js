const express = require('express');
const authController = require('../controllers/authController');
// No middleware for now per instructions

const router = express.Router();

router.post('/login', authController.login);

module.exports = router;
