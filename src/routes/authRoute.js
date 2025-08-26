const express = require('express');
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');

const router = express.Router();


// POST /api/auth/login - User login
router.post('/login', validateLogin, authController.login);

module.exports = router;