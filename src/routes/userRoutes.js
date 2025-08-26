const express = require('express');
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/users/profile - Get user profile
router.get('/', authenticateUser, userController.getProfile);

// PUT /api/users/profile - Update user profile
router.put('/:id', authenticateUser, userController.updateProfile);

module.exports = router;