const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authenticateAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// GET /api/dashboard/membership-status - Get counts of active and inactive members
router.get(
  '/membership-status',
  authenticateUser,
  authenticateAdmin,
  dashboardController.getMembershipStatusCounts
);

module.exports = router;