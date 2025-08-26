const axios = require('axios');
const { db } = require('../config/firebase');
const helpers = require('../utils/helpers');

const isValidYouTubeUrl = url => {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return regex.test(url);
};

// HEAD can be unreliable for some hosts; tiny GET range is safer.
const isUrlAccessible = async url => {
  try {
    const resp = await axios.get(url, {
      maxRedirects: 5,
      timeout: 8000,
      headers: { Range: 'bytes=0-0' }
    });
    return resp.status >= 200 && resp.status < 400;
  } catch {
    return false;
  }
};

/**
 * Resolve a category input (ID or name) to a Firestore document ID.
 * - Tries direct doc(id) first (no sanitization; IDs must remain exact).
 * - If not found, tries lookup by name == sanitized(name).
 * Returns: { id, doc } or null if not found.
 */
const resolveCategoryByIdOrName = async (categoryInput) => {
  if (typeof categoryInput !== 'string' || !categoryInput.trim()) return null;

  const candidate = categoryInput.trim();

  // Try as ID first
  let doc = await db.collection('categories').doc(candidate).get();
  if (doc.exists) {
    return { id: doc.id, doc };
  }

  // Fallback: try as name (sanitize as human text)
  const sanitizedName = helpers.sanitizeInput(candidate);
  const byName = await db
    .collection('categories')
    .where('name', '==', sanitizedName)
    .limit(1)
    .get();

  if (!byName.empty) {
    const first = byName.docs[0];
    return { id: first.id, doc: first };
  }

  return null;
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

// Create new resource (accepts category ID or name)
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

    // URL validation
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

    // Resolve category by ID or name (Option B)
    const resolved = await resolveCategoryByIdOrName(category);
    if (!resolved) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Category does not exist', details: { field: 'category' } }
      });
    }
    const categoryId = resolved.id;

    const now = new Date();
    const data = {
      title: sanitizedTitle,
      description: sanitizedDesc,
      type,
      url: sanitizedUrl,
      thumbnail_url: sanitizedThumb,
      category: categoryId,
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

// Update resource (accepts category ID or name)
const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Validate & check URL if provided
    if (updates.url) {
      try {
        new URL(updates.url);
      } catch {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid URL format', details: { field: 'url' } }
        });
      }
      if ((updates.type === 'video' || !updates.type) && !isValidYouTubeUrl(updates.url) && (updates.type === 'video')) {
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

    // Resolve category by ID or name if provided
    if (updates.category) {
      const resolved = await resolveCategoryByIdOrName(updates.category);
      if (!resolved) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Category does not exist', details: { field: 'category' } }
        });
      }
      updates.category = resolved.id;
    }

    // Sanitize string fields EXCEPT 'category' (to avoid mangling IDs)
    Object.keys(updates).forEach(key => {
      if (key !== 'category' && typeof updates[key] === 'string') {
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

// Bulk upsert resources
const bulkUpsertResources = async (req, res) => {
  try {
    const { resources } = req.body;
    
    if (!Array.isArray(resources) || resources.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Resources array is required and must not be empty' }
      });
    }

    const results = [];
    const errors = [];

    for (const resource of resources) {
      try {
        const { id, ...resourceData } = resource;
        
        if (id) {
          // Update existing resource
          await db.collection('resources').doc(id).update({
            ...resourceData,
            updated_at: new Date()
          });
          results.push({ id, action: 'updated' });
        } else {
          // Create new resource
          const docRef = await db.collection('resources').add({
            ...resourceData,
            created_at: new Date(),
            updated_at: new Date(),
            is_active: true
          });
          results.push({ id: docRef.id, action: 'created' });
        }
      } catch (error) {
        errors.push({ resource, error: error.message });
      }
    }

    res.json({
      success: true,
      data: { results, errors },
      message: `Bulk operation completed. ${results.length} successful, ${errors.length} failed.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

// Bulk activate resources
const bulkActivateResources = async (req, res) => {
  try {
    const { resourceIds } = req.body;
    
    if (!Array.isArray(resourceIds) || resourceIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Resource IDs array is required and must not be empty' }
      });
    }

    const batch = db.batch();
    
    resourceIds.forEach(id => {
      const ref = db.collection('resources').doc(id);
      batch.update(ref, { is_active: true, updated_at: new Date() });
    });

    await batch.commit();

    res.json({
      success: true,
      message: `${resourceIds.length} resources activated successfully`
    });
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
