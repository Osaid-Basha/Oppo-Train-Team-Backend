const { db, admin } = require('../config/firebase');

const userService = {
  // Get user by ID
  async getUserById(userId) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return null;
      }
      return {
        id: userId,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  },

  // Get user by email
  async getUserByEmail(email) {
    try {
      const userQuery = await db.collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (userQuery.empty) {
        return null;
      }

      const userDoc = userQuery.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  },

  // Check if student ID exists
  async isStudentIdTaken(studentId, excludeUserId = null) {
    try {
      let query = db.collection('users').where('student_id', '==', studentId);
      
      const snapshot = await query.get();
      
      if (excludeUserId) {
        // Filter out the current user when updating
        const existingUsers = snapshot.docs.filter(doc => doc.id !== excludeUserId);
        return existingUsers.length > 0;
      }
      
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking student ID:', error);
      throw error;
    }
  },

  // Get users by status
  async getUsersByStatus(status, limit = 50) {
    try {
      const query = await db.collection('users')
        .where('membership_status', '==', status)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .get();

      const users = [];
      query.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return users;
    } catch (error) {
      console.error('Error getting users by status:', error);
      throw error;
    }
  },

  // Update user status
  async updateUserStatus(userId, status, adminUserId) {
    try {
      const updateData = {
        membership_status: status,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_by: adminUserId
      };

      if (status === 'approved') {
        updateData.is_member = true;
        updateData.approved_by = adminUserId;
        updateData.approved_at = admin.firestore.FieldValue.serverTimestamp();
      } else if (status === 'rejected') {
        updateData.is_member = false;
        updateData.rejected_by = adminUserId;
        updateData.rejected_at = admin.firestore.FieldValue.serverTimestamp();
      }

      await db.collection('users').doc(userId).update(updateData);
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Get all admins
  async getAdmins() {
    try {
      const adminQuery = await db.collection('users')
        .where('is_admin', '==', true)
        .get();

      const admins = [];
      adminQuery.forEach(doc => {
        const userData = doc.data();
        admins.push({
          id: doc.id,
          email: userData.email,
          full_name: userData.full_name,
          created_at: userData.created_at
        });
      });

      return admins;
    } catch (error) {
      console.error('Error getting admins:', error);
      throw error;
    }
  },

  // Create user document
  async createUserDocument(userId, userData) {
    try {
      const userDoc = {
        ...userData,
        is_member: false,
        is_admin: false,
        membership_status: 'pending',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('users').doc(userId).set(userDoc);
      return userDoc;
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }
};

module.exports = userService;