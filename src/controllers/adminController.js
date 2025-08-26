const { db, admin } = require('../config/firebase');
const emailService = require('../services/emailServices');

const adminController = {
  // List all members
  async getAllMembers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const search = req.query.search;

      let query = db.collection('users');

      // Filter by membership status
      if (status) {
        query = query.where('membership_status', '==', status);
      }

      // Add search functionality
      if (search) {
        query = query.where('full_name', '>=', search)
                    .where('full_name', '<=', search + '\uf8ff');
      }

      // Order by creation date
      query = query.orderBy('created_at', 'desc');

      const snapshot = await query.get();
      const users = [];

      snapshot.forEach(doc => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          ...userData,
          password: undefined
        });
      });

      // Manual pagination
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedUsers = users.slice(startIndex, endIndex);

      res.json({
        users: paginatedUsers,
        pagination: {
          currentPage: page,
          totalUsers: users.length,
          totalPages: Math.ceil(users.length / limit),
          hasNext: endIndex < users.length,
          hasPrev: page > 1
        }
      });

    } catch (error) {
      console.error('Error fetching members:', error);
      res.status(500).json({ error: 'Failed to fetch members' });
    }
  },

  // Get pending member requests
  async getPendingMembers(req, res) {
    try {
      const pendingQuery = await db.collection('users')
        .where('membership_status', '==', 'pending')
        .orderBy('created_at', 'desc')
        .get();

      const pendingUsers = [];
      pendingQuery.forEach(doc => {
        const userData = doc.data();
        pendingUsers.push({
          id: doc.id,
          email: userData.email,
          full_name: userData.full_name,
          student_id: userData.student_id,
          university: userData.university,
          year_of_study: userData.year_of_study,
          phone: userData.phone,
          created_at: userData.created_at,
          membership_status: userData.membership_status
        });
      });

      res.json({
        pending_requests: pendingUsers,
        count: pendingUsers.length
      });

    } catch (error) {
      console.error('Error fetching pending requests:', error);
      res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
  },

  // Approve member
  async approveMember(req, res) {
    try {
      const userId = req.params.id;
      const { message } = req.body;

      // Check if user exists
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();

      // Update user status
      await db.collection('users').doc(userId).update({
        membership_status: 'approved',
        is_member: true,
        approved_by: req.user.uid,
        approved_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Send approval email
      try {
        await emailService.sendApprovalEmail(userData.email, {
          full_name: userData.full_name,
          message: message || 'Welcome to AIAS An-Najah Chapter!'
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      res.json({
        message: 'Member approved successfully',
        user: {
          id: userId,
          full_name: userData.full_name,
          email: userData.email,
          membership_status: 'approved'
        }
      });

    } catch (error) {
      console.error('Error approving member:', error);
      res.status(500).json({ error: 'Failed to approve member' });
    }
  },

  // Reject member
  async rejectMember(req, res) {
    try {
      const userId = req.params.id;
      const { reason } = req.body;

      // Check if user exists
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();

      // Update user status
      await db.collection('users').doc(userId).update({
        membership_status: 'rejected',
        is_member: false,
        rejected_by: req.user.uid,
        rejected_at: admin.firestore.FieldValue.serverTimestamp(),
        rejection_reason: reason || 'Not specified',
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Send rejection email
      try {
        await emailService.sendRejectionEmail(userData.email, {
          full_name: userData.full_name,
          reason: reason || 'Please contact admin for more information.'
        });
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }

      res.json({
        message: 'Member rejected successfully',
        user: {
          id: userId,
          full_name: userData.full_name,
          email: userData.email,
          membership_status: 'rejected'
        }
      });

    } catch (error) {
      console.error('Error rejecting member:', error);
      res.status(500).json({ error: 'Failed to reject member' });
    }
  },

  // Delete member
  async deleteMember(req, res) {
    try {
      const userId = req.params.id;

      // Check if user exists
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();

      // Don't allow deleting other admins
      if (userData.is_admin && userData.email !== req.user.email) {
        return res.status(403).json({ error: 'Cannot delete other admin users' });
      }

      // Delete from Firebase Auth
      try {
        await admin.auth().deleteUser(userId);
      } catch (authError) {
        console.error('Error deleting from Auth:', authError);
      }

      // Delete from Firestore
      await db.collection('users').doc(userId).delete();

      res.json({
        message: 'Member deleted successfully',
        deleted_user: {
          id: userId,
          full_name: userData.full_name,
          email: userData.email
        }
      });

    } catch (error) {
      console.error('Error deleting member:', error);
      res.status(500).json({ error: 'Failed to delete member' });
    }
  },

  // Update member
  async updateMember(req, res) {
    try {
      const userId = req.params.id;
      const {
        full_name,
        student_id,
        university,
        year_of_study,
        phone,
        is_member,
        membership_status
      } = req.body;

      // Check if user exists
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prepare update data
      const updateData = {
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_by: req.user.uid
      };

      // Add fields that are being updated
      if (full_name !== undefined) updateData.full_name = full_name;
      if (student_id !== undefined) updateData.student_id = student_id;
      if (university !== undefined) updateData.university = university;
      if (year_of_study !== undefined) updateData.year_of_study = year_of_study;
      if (phone !== undefined) updateData.phone = phone;
      if (is_member !== undefined) updateData.is_member = is_member;
      if (membership_status !== undefined) updateData.membership_status = membership_status;

      // Update user
      await db.collection('users').doc(userId).update(updateData);

      // Get updated user data
      const updatedUserDoc = await db.collection('users').doc(userId).get();
      const updatedUserData = updatedUserDoc.data();

      res.json({
        message: 'Member updated successfully',
        user: {
          id: userId,
          ...updatedUserData
        }
      });

    } catch (error) {
      console.error('Error updating member:', error);
      res.status(500).json({ error: 'Failed to update member' });
    }
  }
};

module.exports = adminController;