const express = require('express');
const memberController = require('../controllers/memberController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authenticateAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// 🔹 Get all members
router.get('/', authenticateUser, authenticateAdmin, memberController.getAllMembers);

// 🔹 Add new member
router.post('/', authenticateUser, authenticateAdmin, memberController.addMember);

// 🔹 Update member
router.put('/:id', authenticateUser, authenticateAdmin, memberController.updateMember);

// Accept member
router.put('/:id/accept', authenticateUser, authenticateAdmin, memberController.acceptMember);

// Deactivate member
router.put('/:id/deactivate', authenticateUser, authenticateAdmin, memberController.deactivateMember);


// 🔹 Delete member
router.delete('/:id', authenticateUser, authenticateAdmin, memberController.deleteMember);

module.exports = router;
