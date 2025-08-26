const router = require('express').Router();
const categories = require('../controllers/categoryController');
const { authenticateAdmin } = require('../middleware/adminAuth');
const { authenticateOptional } = require('../middleware/authMiddleware');

router.get('/', authenticateOptional, categories.listCategories);
router.post('/', authenticateAdmin, categories.createCategory);
router.put('/:id', authenticateAdmin, categories.updateCategory);
router.delete('/:id', authenticateAdmin, categories.deleteCategory);

module.exports = router;

