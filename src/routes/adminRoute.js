const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authenticateAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// GET /api/admin/members - Get all members (admin only)
router.get('/users', authenticateUser, authenticateAdmin, adminController.getAllMembers);

// GET /api/admin/members/pending - Get pending member requests
router.get('/users/pending', authenticateUser, authenticateAdmin, adminController.getPendingMembers);

// PUT /api/admin/members/:id - Update member
router.put('/users/:id', authenticateUser, authenticateAdmin, adminController.updateMember);

// DELETE /api/admin/members/:id - Delete member
router.delete('/users/:id', authenticateUser, authenticateAdmin, adminController.deleteMember);

// POST /api/admin/members/:id/approve - Approve member
router.post('/users/:id/approve', authenticateUser, authenticateAdmin, adminController.approveMember);

// POST /api/admin/members/:id/reject - Reject member
router.post('/users/:id/reject', authenticateUser, authenticateAdmin, adminController.rejectMember);

module.exports = router;