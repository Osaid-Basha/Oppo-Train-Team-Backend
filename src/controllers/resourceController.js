const axios = require('axios');
const { db } = require('../config/firebase');
const helpers = require('../utils/helpers');

const isValidYouTubeUrl = url => {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return regex.test(url);
};

const isUrlAccessible = async url => {
  try {
    await axios.head(url);
    return true;
  } catch {
    return false;
  }
};

// List resources with filtering and pagination
const listResources = async (req, res) => {
  try {
    const { category, type, search, page = 1, limit = 10, is_active } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const isAdmin = req.user && req.user.is_admin;
    let query = db.collection('resources');

    if (!isAdmin) {
      query = query.where('is_active', '==', true);
    } else if (is_active !== undefined) {
      query = query.where('is_active', '==', is_active === 'true');
    }

    if (category) query = query.where('category', '==', category);
    if (type) query = query.where('type', '==', type);

    const snapshot = await query.get();
    let resources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (search) {
      const term = search.toLowerCase();
      resources = resources.filter(r =>
        (r.title && r.title.toLowerCase().includes(term)) ||
        (r.description && r.description.toLowerCase().includes(term)) ||
        (Array.isArray(r.tags) && r.tags.some(t => t.toLowerCase().includes(term)))
      );
    }

    const total = resources.length;
    const start = (pageNum - 1) * limitNum;
    const paginated = resources.slice(start, start + limitNum);

    res.json({
      success: true,
      data: paginated,
      message: 'Resources fetched successfully',
      pagination: { page: pageNum, limit: limitNum, total, hasNext: start + limitNum < total }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// Create new resource
const createResource = async (req, res) => {
  try {
    const { title, description = '', type, url, thumbnail_url = '', category, tags = [], is_active = true } = req.body;

    if (!title || !type || !url || !category) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' }
      });
    }

    const sanitizedTitle = helpers.sanitizeInput(title);
    const sanitizedDesc = helpers.sanitizeInput(description);
    const sanitizedUrl = helpers.sanitizeInput(url);
    const sanitizedThumb = helpers.sanitizeInput(thumbnail_url);
    const sanitizedCategory = helpers.sanitizeInput(category);

    try {
      new URL(sanitizedUrl);
    } catch {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid URL format', details: { field: 'url' } }
      });
    }

    if (type === 'video' && !isValidYouTubeUrl(sanitizedUrl)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid YouTube URL format', details: { field: 'url' } }
      });
    }

    if (!(await isUrlAccessible(sanitizedUrl))) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'URL is not accessible', details: { field: 'url' } }
      });
    }

    const catDoc = await db.collection('categories').doc(sanitizedCategory).get();
    if (!catDoc.exists) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Category does not exist', details: { field: 'category' } }
      });
    }

    const now = new Date();
    const data = {
      title: sanitizedTitle,
      description: sanitizedDesc,
      type,
      url: sanitizedUrl,
      thumbnail_url: sanitizedThumb,
      category: sanitizedCategory,
      tags: Array.isArray(tags) ? tags.map(t => helpers.sanitizeInput(t)) : [],
      is_active,
      created_by: req.user.uid,
      created_at: now,
      updated_at: now
    };

    const docRef = await db.collection('resources').add(data);

    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...data },
      message: 'Resource created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// Get single resource by ID
const getResource = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('resources').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } });
    }

    const resource = { id: doc.id, ...doc.data() };
    const isAdmin = req.user && req.user.is_admin;
    if (!resource.is_active && !isAdmin) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } });
    }

    const catDoc = await db.collection('categories').doc(resource.category).get();
    if (catDoc.exists) {
      resource.category_info = { id: catDoc.id, ...catDoc.data() };
    }

    res.json({ success: true, data: resource, message: 'Resource fetched successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// Update resource
const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.url) {
      try {
        new URL(updates.url);
      } catch {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid URL format', details: { field: 'url' } }
        });
      }
      if (updates.type === 'video' && !isValidYouTubeUrl(updates.url)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid YouTube URL format', details: { field: 'url' } }
        });
      }
      if (!(await isUrlAccessible(updates.url))) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'URL is not accessible', details: { field: 'url' } }
        });
      }
    }

    if (updates.category) {
      const catDoc = await db.collection('categories').doc(updates.category).get();
      if (!catDoc.exists) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Category does not exist', details: { field: 'category' } }
        });
      }
    }

    Object.keys(updates).forEach(key => {
      if (typeof updates[key] === 'string') {
        updates[key] = helpers.sanitizeInput(updates[key]);
      }
    });

    updates.updated_at = new Date();

    await db.collection('resources').doc(id).update(updates);
    const updatedDoc = await db.collection('resources').doc(id).get();

    res.json({
      success: true,
      data: { id: updatedDoc.id, ...updatedDoc.data() },
      message: 'Resource updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// Soft delete resource
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('resources').doc(id).update({
      is_active: false,
      updated_at: new Date()
    });
    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// Bulk create/update resources
const bulkUpsertResources = async (req, res) => {
  try {
    const resources = Array.isArray(req.body.resources) ? req.body.resources : [];
    if (!resources.length) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'No resources provided' }
      });
    }

    const batch = db.batch();
    const now = new Date();

    for (const r of resources) {
      const ref = r.id ? db.collection('resources').doc(r.id) : db.collection('resources').doc();
      batch.set(ref, { ...r, updated_at: now, created_at: r.created_at || now, created_by: req.user.uid }, { merge: true });
    }

    await batch.commit();

    res.json({ success: true, message: 'Bulk operation completed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// Bulk activate/deactivate resources
const bulkActivateResources = async (req, res) => {
  try {
    const { ids = [], is_active = true } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'No resource IDs provided' }
      });
    }

    const batch = db.batch();
    const now = new Date();
    ids.forEach(id => {
      const ref = db.collection('resources').doc(id);
      batch.update(ref, { is_active, updated_at: now });
    });
    await batch.commit();

    res.json({ success: true, message: 'Resources updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

module.exports = {
  listResources,
  createResource,
  getResource,
  updateResource,
  deleteResource,
  bulkUpsertResources,
  bulkActivateResources
};

