const { db } = require('../config/firebase');

const userController = {
  // Get user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.uid;
      
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();
      
      res.json({
        user: {
          id: userId,
          email: userData.email,
          full_name: userData.full_name,
          student_id: userData.student_id,
          university: userData.university,
          year_of_study: userData.year_of_study,
          phone: userData.phone,
          is_member: userData.is_member,
          membership_status: userData.membership_status,
          created_at: userData.created_at
        }
      });

    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  // Update user profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.uid;
      const { full_name, phone, university, year_of_study } = req.body;

      const updateData = {
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };

      if (full_name !== undefined) updateData.full_name = full_name;
      if (phone !== undefined) updateData.phone = phone;
      if (university !== undefined) updateData.university = university;
      if (year_of_study !== undefined) updateData.year_of_study = year_of_study;

      await db.collection('users').doc(userId).update(updateData);

      res.json({
        message: 'Profile updated successfully'
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
};

module.exports = userController;