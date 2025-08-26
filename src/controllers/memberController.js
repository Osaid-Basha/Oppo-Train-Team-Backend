const { db, admin } = require('../config/firebase');

const memberController = {
  // 🔹 Get all members (only is_member = true)
  async getAllMembers(req, res) {
    try {
      const snapshot = await db.collection('users')
        .where('is_member', '==', true)
        .get();

      if (snapshot.empty) {
        return res.json({ members: [] });
      }

      const members = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({ members });
    } catch (error) {
      console.error('Error fetching members:', error);
      res.status(500).json({ error: 'Failed to fetch members' });
    }
  },

  // 🔹 Add new member (by admin)
  async addMember(req, res) {
    try {
      const { 
        first_name, 
        last_name, 
        student_id, 
        email, 
        password, 
        re_password, 
        gender, 
        year_of_study, 
        phone, 
        date_of_birth, 
        address 
      } = req.body;
  
      if (password !== re_password) {
        return res.status(400).json({ error: "Passwords do not match" });
      }

      // 🟢 أنشئ user في Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: `${first_name} ${last_name}`,
      });

      // 🟢 خزّن البيانات في Firestore
      const newMember = {
        uid: userRecord.uid,
        full_name: `${first_name} ${last_name}`,
        student_id,
        email,
        gender,
        year_of_study,
        phone,
        date_of_birth,
        address,
        is_member: true,
        membership_status: "pending", 
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };
  
      await db.collection("users").doc(userRecord.uid).set(newMember);
  
      res.json({ message: "Member added successfully", id: userRecord.uid });
    } catch (error) {
      console.error("Error adding member:", error);
      res.status(500).json({ error: "Failed to add member", details: error.message });
    }
  },

  // 🔹 Update member
  async updateMember(req, res) {
    try {
      const { id } = req.params;
      const { first_name, last_name, student_id, gender, year_of_study, phone, date_of_birth, address } = req.body;

      const updateData = {
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (first_name || last_name) {
        updateData.full_name = `${first_name || ""} ${last_name || ""}`.trim();
      }
      if (student_id !== undefined) updateData.student_id = student_id;
      if (gender !== undefined) updateData.gender = gender;
      if (year_of_study !== undefined) updateData.year_of_study = year_of_study;
      if (phone !== undefined) updateData.phone = phone;
      if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth;
      if (address !== undefined) updateData.address = address;

      const userRef = db.collection('users').doc(id);
      await userRef.update(updateData);

      res.json({ message: "Member updated successfully" });
    } catch (error) {
      console.error("Error updating member:", error);
      res.status(500).json({ error: "Failed to update member" });
    }
  },

  // Accept member (admin approves)
async acceptMember(req, res) {
    try {
      const { id } = req.params;
  
      const userRef = db.collection('users').doc(id);
      const userDoc = await userRef.get();
  
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'Member not found' });
      }
  
      await userRef.update({
        is_member: true,
        membership_status: 'approved',
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
  
      res.json({ message: 'Member approved successfully' });
    } catch (error) {
      console.error('Error approving member:', error);
      res.status(500).json({ error: 'Failed to approve member' });
    }
  },
  
  // Reject / deactivate member
  async deactivateMember(req, res) {
    try {
      const { id } = req.params;
  
      const userRef = db.collection('users').doc(id);
      const userDoc = await userRef.get();
  
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'Member not found' });
      }
  
      await userRef.update({
        is_member: false,
        membership_status: 'inactive',
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
  
      res.json({ message: 'Member deactivated successfully' });
    } catch (error) {
      console.error('Error deactivating member:', error);
      res.status(500).json({ error: 'Failed to deactivate member' });
    }
  },

  // 🔹 Delete member
  async deleteMember(req, res) {
    try {
      const { id } = req.params;

      const userRef = db.collection('users').doc(id);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: 'Member not found' });
      }

      // 🟢 احذف من Firestore + Firebase Auth
      await userRef.delete();
      await admin.auth().deleteUser(id);

      res.json({ message: 'Member deleted successfully' });
    } catch (error) {
      console.error('Error deleting member:', error);
      res.status(500).json({ error: 'Failed to delete member' });
    }
  }
};

module.exports = memberController;
