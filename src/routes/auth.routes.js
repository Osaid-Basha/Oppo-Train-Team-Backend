// src/routes/auth.routes.js
const { Router } = require('express');
const { forgotPassword, verifyCode, resetPassword } = require('../controllers/auth.controller');

const router = Router();
router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyCode);      // ← صفحتك
router.post('/reset-password', resetPassword);

module.exports = router;
