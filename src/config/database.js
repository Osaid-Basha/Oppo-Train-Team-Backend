const { db } = require('./firebase');
const CONSTANTS = require('../utils/constants');

// Database helper functions
const database = {
  // Generic CRUD operations
  async create(collection, data, id = null) {
    try {
      if (id) {
        await db.collection(collection).doc(id).set(data);
        return { id, ...data };
      } else {
        const docRef = await db.collection(collection).add(data);
        return { id: docRef.id, ...data };
      }
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  },

  async findById(collection, id) {
    try {
      const doc = await db.collection(collection).doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error(`Error finding document by ID in ${collection}:`, error);
      throw error;
    }
  },

  async findOne(collection, field, value) {
    try {
      const snapshot = await db.collection(collection)
        .where(field, '==', value)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error(`Error finding document in ${collection}:`, error);
      throw error;
    }
  },

  async findMany(collection, filters = [], orderBy = null, limit = null) {
    try {
      let query = db.collection(collection);

      // Apply filters
      filters.forEach(filter => {
        const { field, operator, value } = filter;
        query = query.where(field, operator, value);
      });

      // Apply ordering
      if (orderBy) {
        const { field, direction = 'asc' } = orderBy;
        query = query.orderBy(field, direction);
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      const results = [];

      snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });

      return results;
    } catch (error) {
      console.error(`Error finding documents in ${collection}:`, error);
      throw error;
    }
  },

  async update(collection, id, data) {
    try {
      await db.collection(collection).doc(id).update({
        ...data,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Return updated document
      return await this.findById(collection, id);
    } catch (error) {
      console.error(`Error updating document in ${collection}:`, error);
      throw error;
    }
  },

  async delete(collection, id) {
    try {
      await db.collection(collection).doc(id).delete();
      return true;
    } catch (error) {
      console.error(`Error deleting document from ${collection}:`, error);
      throw error;
    }
  },

  async exists(collection, field, value, excludeId = null) {
    try {
      let query = db.collection(collection).where(field, '==', value);
      
      const snapshot = await query.get();
      
      if (excludeId) {
        const existingDocs = snapshot.docs.filter(doc => doc.id !== excludeId);
        return existingDocs.length > 0;
      }
      
      return !snapshot.empty;
    } catch (error) {
      console.error(`Error checking existence in ${collection}:`, error);
      throw error;
    }
  },

  // Pagination helper
  async paginate(collection, filters = [], orderBy = null, page = 1, limit = 10) {
    try {
      let query = db.collection(collection);

      // Apply filters
      filters.forEach(filter => {
        const { field, operator, value } = filter;
        query = query.where(field, operator, value);
      });

      // Apply ordering
      if (orderBy) {
        const { field, direction = 'asc' } = orderBy;
        query = query.orderBy(field, direction);
      }

      // Get total count (approximate)
      const countSnapshot = await query.get();
      const totalItems = countSnapshot.size;

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.offset(offset).limit(limit);

      const snapshot = await query.get();
      const results = [];

      snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });

      return {
        data: results,
        pagination: {
          currentPage: page,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          hasNext: (page * limit) < totalItems,
          hasPrev: page > 1,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error(`Error paginating ${collection}:`, error);
      throw error;
    }
  },

  // Batch operations
  async batchWrite(operations) {
    try {
      const batch = db.batch();

      operations.forEach(operation => {
        const { type, collection, id, data } = operation;
        const docRef = db.collection(collection).doc(id);

        switch (type) {
          case 'create':
          case 'set':
            batch.set(docRef, data);
            break;
          case 'update':
            batch.update(docRef, data);
            break;
          case 'delete':
            batch.delete(docRef);
            break;
          default:
            throw new Error(`Invalid batch operation type: ${type}`);
        }
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error in batch write:', error);
      throw error;
    }
  }
};

module.exports = database;