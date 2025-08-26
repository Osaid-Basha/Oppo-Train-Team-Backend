const router = require('express').Router();
const resources = require('../controllers/resourceController');
const { authenticateAdmin } = require('../middleware/adminAuth');
const { authenticateOptional } = require('../middleware/authMiddleware');

// Resource routes
router.get('/', authenticateOptional, resources.listResources);
router.post('/', authenticateAdmin, resources.createResource);
router.post('/bulk', authenticateAdmin, resources.bulkUpsertResources);
router.put('/bulk/activate', authenticateAdmin, resources.bulkActivateResources);
router.get('/:id', authenticateOptional, resources.getResource);
router.put('/:id', authenticateAdmin, resources.updateResource);
router.delete('/:id', authenticateAdmin, resources.deleteResource);

module.exports = router;

