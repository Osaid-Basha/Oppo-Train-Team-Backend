const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Login
router.post('/login', authController.login);

// OTP flow
router.post('/forgot-password-otp', authController.forgotPasswordOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password-otp', authController.resetPasswordWithOTP);

module.exports = router;
