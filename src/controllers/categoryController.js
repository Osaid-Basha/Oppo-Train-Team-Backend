const { db } = require('../config/firebase');
const helpers = require('../utils/helpers');

// List categories with resource counts
const listCategories = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.is_admin;
    let query = db.collection('categories');
    if (!isAdmin) {
      query = query.where('is_active', '==', true);
    }

    const snapshot = await query.get();
    const categories = await Promise.all(snapshot.docs.map(async doc => {
      const data = { id: doc.id, ...doc.data() };
      const countSnap = await db.collection('resources').where('category', '==', doc.id).get();
      data.resourceCount = countSnap.size;
      return data;
    }));

    res.json({ success: true, data: categories, message: 'Categories fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  try {
    const { name, description = '', parent_category = null, is_active = true } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name is required' } });
    }

    const sanitizedName = helpers.sanitizeInput(name);
    const sanitizedDesc = helpers.sanitizeInput(description);

    const existing = await db.collection('categories').where('name', '==', sanitizedName).get();
    if (!existing.empty) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Category name must be unique', details: { field: 'name' } } });
    }

    if (parent_category) {
      const parentDoc = await db.collection('categories').doc(parent_category).get();
      if (!parentDoc.exists) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Parent category not found', details: { field: 'parent_category' } } });
      }
    }

    const data = {
      name: sanitizedName,
      description: sanitizedDesc,
      parent_category: parent_category || null,
      is_active
    };

    const docRef = await db.collection('categories').add(data);
    res.status(201).json({ success: true, data: { id: docRef.id, ...data }, message: 'Category created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.name) {
      updates.name = helpers.sanitizeInput(updates.name);
      const existing = await db.collection('categories').where('name', '==', updates.name).get();
      const duplicate = existing.docs.find(doc => doc.id !== id);
      if (duplicate) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Category name must be unique', details: { field: 'name' } } });
      }
    }

    if (updates.parent_category) {
      const parentDoc = await db.collection('categories').doc(updates.parent_category).get();
      if (!parentDoc.exists) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Parent category not found', details: { field: 'parent_category' } } });
      }
    }

    Object.keys(updates).forEach(key => {
      if (typeof updates[key] === 'string') {
        updates[key] = helpers.sanitizeInput(updates[key]);
      }
    });

    await db.collection('categories').doc(id).update(updates);
    const updatedDoc = await db.collection('categories').doc(id).get();

    res.json({ success: true, data: { id: updatedDoc.id, ...updatedDoc.data() }, message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// Delete category (soft)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const resSnap = await db.collection('resources').where('category', '==', id).get();
    if (!resSnap.empty) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Category has resources and cannot be deleted' } });
    }

    await db.collection('categories').doc(id).update({ is_active: false });
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };

