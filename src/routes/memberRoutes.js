const express = require('express');
const memberController = require('../controllers/memberController');
const {
  validateMemberCreation,
  validateMemberUpdate,
  validateMemberId,
  validateApprovalData,
  validateBulkUpdate,
  validateQueryParams
} = require('../middlewares/memberValidationMiddleware');

const router = express.Router();

// GET /api/members - Get all members with filtering and pagination
router.get('/', validateQueryParams, memberController.getAllMembers);

// GET /api/members/stats - Get member statistics
router.get('/stats', memberController.getMemberStats);

// GET /api/members/pending - Get pending members
router.get('/pending', memberController.getPendingMembers);

// GET /api/members/active - Get active members
router.get('/active', memberController.getActiveMembers);

// GET /api/members/inactive - Get inactive members
router.get('/inactive', memberController.getInactiveMembers);

// POST /api/members - Create new member
router.post('/', validateMemberCreation, memberController.createMember);

// GET /api/members/:id - Get member by ID
router.get('/:id', validateMemberId, memberController.getMemberById);

// PUT /api/members/:id - Update member
router.put('/:id', validateMemberId, validateMemberUpdate, memberController.updateMember);

// DELETE /api/members/:id - Delete member
router.delete('/:id', validateMemberId, memberController.deleteMember);

// POST /api/members/:id/approve - Approve member
router.post('/:id/approve', validateMemberId, validateApprovalData, memberController.approveMember);

// POST /api/members/:id/reject - Reject member
router.post('/:id/reject', validateMemberId, validateApprovalData, memberController.rejectMember);

// POST /api/members/:id/activate - Activate member
router.post('/:id/activate', validateMemberId, memberController.activateMember);

// POST /api/members/:id/deactivate - Deactivate member
router.post('/:id/deactivate', validateMemberId, memberController.deactivateMember);

// POST /api/members/bulk-update - Bulk update members
router.post('/bulk-update', validateBulkUpdate, memberController.bulkUpdateMembers);

module.exports = router;
