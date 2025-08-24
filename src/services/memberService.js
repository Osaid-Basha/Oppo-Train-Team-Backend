const { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  serverTimestamp,
  limit,
  startAfter
} = require('firebase/firestore');
const { db } = require('../config/firebase');
const Member = require('../models/Member');

class MemberService {
  constructor() {
    this.collectionName = 'members';
  }

  // Get all members with pagination and filtering
  async getAllMembers(options = {}) {
    try {
      const { 
        status, 
        search, 
        limit: limitCount = 50, 
        startAfter: startAfterDoc = null,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Use a simple query without complex filters to avoid index requirements
      let q = collection(db, this.collectionName);

      // Only apply status filter if it's a simple one
      if (status && status !== 'all') {
        q = query(q, where('status', '==', status));
      }

      // Get all documents and apply filtering/sorting client-side
      const querySnapshot = await getDocs(q);
      let members = [];
      
      querySnapshot.forEach((doc) => {
        const member = Member.fromFirestore(doc);
        member.id = doc.id;
        members.push(member);
      });

      // Apply search filter client-side
      if (search) {
        const searchLower = search.toLowerCase();
        members = members.filter(member => 
          member.firstName.toLowerCase().includes(searchLower) ||
          member.lastName.toLowerCase().includes(searchLower) ||
          member.email.toLowerCase().includes(searchLower) ||
          member.studentNumber.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting client-side
      members.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (sortOrder === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });

      // Apply pagination client-side
      const hasMore = members.length > limitCount;
      const paginatedMembers = members.slice(0, limitCount);

      return {
        success: true,
        data: paginatedMembers,
        count: paginatedMembers.length,
        hasMore
      };
    } catch (error) {
      console.error('Error getting members:', error);
      throw new Error('Failed to fetch members');
    }
  }

  // Get member by ID
  async getMemberById(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Member not found'
        };
      }
      
      const member = Member.fromFirestore(docSnap);
      member.id = docSnap.id;
      
      return {
        success: true,
        data: member
      };
    } catch (error) {
      console.error('Error getting member:', error);
      throw new Error('Failed to fetch member');
    }
  }

  // Get member by email
  async getMemberByEmail(email) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('email', '==', email.toLowerCase()),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return {
          success: false,
          error: 'Member not found'
        };
      }
      
      const doc = querySnapshot.docs[0];
      const member = Member.fromFirestore(doc);
      member.id = doc.id;
      
      return {
        success: true,
        data: member
      };
    } catch (error) {
      console.error('Error getting member by email:', error);
      throw new Error('Failed to fetch member by email');
    }
  }

  // Get member by student number
  async getMemberByStudentNumber(studentNumber) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('studentNumber', '==', studentNumber),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return {
          success: false,
          error: 'Member not found'
        };
      }
      
      const doc = querySnapshot.docs[0];
      const member = Member.fromFirestore(doc);
      member.id = doc.id;
      
      return {
        success: true,
        data: member
      };
    } catch (error) {
      console.error('Error getting member by student number:', error);
      throw new Error('Failed to fetch member by student number');
    }
  }

  // Create new member
  async createMember(memberData) {
    try {
      // Validate the member data
      const validation = Member.validate(memberData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Check if email already exists
      const existingEmail = await this.getMemberByEmail(memberData.email);
      if (existingEmail.success) {
        return {
          success: false,
          errors: ['Email already exists']
        };
      }

      // Check if student number already exists
      const existingStudentNumber = await this.getMemberByStudentNumber(memberData.studentNumber);
      if (existingStudentNumber.success) {
        return {
          success: false,
          errors: ['Student number already exists']
        };
      }

      // Create member instance
      const member = new Member(memberData);
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...member.toFirestore(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...member.toFirestore()
        },
        message: 'Member created successfully'
      };
    } catch (error) {
      console.error('Error creating member:', error);
      throw new Error('Failed to create member');
    }
  }

  // Update member
  async updateMember(id, updateData) {
    try {
      // Check if member exists
      const existingMember = await this.getMemberById(id);
      if (!existingMember.success) {
        return existingMember;
      }

      // Validate the update data
      const validation = Member.validateUpdate(updateData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Check email uniqueness if email is being updated
      if (updateData.email && updateData.email !== existingMember.data.email) {
        const existingEmail = await this.getMemberByEmail(updateData.email);
        if (existingEmail.success) {
          return {
            success: false,
            errors: ['Email already exists']
          };
        }
      }

      // Check student number uniqueness if student number is being updated
      if (updateData.studentNumber && updateData.studentNumber !== existingMember.data.studentNumber) {
        const existingStudentNumber = await this.getMemberByStudentNumber(updateData.studentNumber);
        if (existingStudentNumber.success) {
          return {
            success: false,
            errors: ['Student number already exists']
          };
        }
      }

      // Update in Firestore
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      // Get updated member
      const updatedMember = await this.getMemberById(id);
      
      return {
        success: true,
        data: updatedMember.data,
        message: 'Member updated successfully'
      };
    } catch (error) {
      console.error('Error updating member:', error);
      throw new Error('Failed to update member');
    }
  }

  // Delete member
  async deleteMember(id) {
    try {
      // Check if member exists
      const existingMember = await this.getMemberById(id);
      if (!existingMember.success) {
        return existingMember;
      }

      // Delete from Firestore
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      
      return {
        success: true,
        message: 'Member deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting member:', error);
      throw new Error('Failed to delete member');
    }
  }

  // Get pending members
  async getPendingMembers() {
    try {
      // Use a simple query without orderBy to avoid index requirements
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      const members = [];
      
      querySnapshot.forEach((doc) => {
        const member = Member.fromFirestore(doc);
        member.id = doc.id;
        members.push(member);
      });
      
      // Sort client-side to avoid Firestore index requirements
      members.sort((a, b) => b.createdAt - a.createdAt);
      
      return {
        success: true,
        data: members,
        count: members.length
      };
    } catch (error) {
      console.error('Error getting pending members:', error);
      throw new Error('Failed to fetch pending members');
    }
  }

  // Get active members
  async getActiveMembers() {
    try {
      // Use a simple query without orderBy to avoid index requirements
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(q);
      const members = [];
      
      querySnapshot.forEach((doc) => {
        const member = Member.fromFirestore(doc);
        member.id = doc.id;
        members.push(member);
      });
      
      // Sort client-side to avoid Firestore index requirements
      members.sort((a, b) => b.createdAt - a.createdAt);
      
      return {
        success: true,
        data: members,
        count: members.length
      };
    } catch (error) {
      console.error('Error getting active members:', error);
      throw new Error('Failed to fetch active members');
    }
  }

  // Get inactive members
  async getInactiveMembers() {
    try {
      // Use a simple query without orderBy to avoid index requirements
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', 'inactive')
      );
      
      const querySnapshot = await getDocs(q);
      const members = [];
      
      querySnapshot.forEach((doc) => {
        const member = Member.fromFirestore(doc);
        member.id = doc.id;
        members.push(member);
      });
      
      // Sort client-side to avoid Firestore index requirements
      members.sort((a, b) => b.createdAt - a.createdAt);
      
      return {
        success: true,
        data: members,
        count: members.length
      };
    } catch (error) {
      console.error('Error getting inactive members:', error);
      throw new Error('Failed to fetch inactive members');
    }
  }

  // Approve member
  async approveMember(id, approvedBy) {
    try {
      // Check if member exists
      const existingMember = await this.getMemberById(id);
      if (!existingMember.success) {
        return existingMember;
      }

      if (existingMember.data.status !== 'pending') {
        return {
          success: false,
          error: 'Member is not pending approval'
        };
      }

      // Update member status to approved
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        status: 'active',
        approvedAt: serverTimestamp(),
        approvedBy: approvedBy,
        updatedAt: serverTimestamp()
      });
      
      // Get updated member
      const updatedMember = await this.getMemberById(id);
      
      return {
        success: true,
        data: updatedMember.data,
        message: 'Member approved successfully'
      };
    } catch (error) {
      console.error('Error approving member:', error);
      throw new Error('Failed to approve member');
    }
  }

  // Reject member
  async rejectMember(id, rejectedBy) {
    try {
      // Check if member exists
      const existingMember = await this.getMemberById(id);
      if (!existingMember.success) {
        return existingMember;
      }

      if (existingMember.data.status !== 'pending') {
        return {
          success: false,
          error: 'Member is not pending approval'
        };
      }

      // Update member status to rejected (inactive)
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        status: 'inactive',
        updatedAt: serverTimestamp()
      });
      
      // Get updated member
      const updatedMember = await this.getMemberById(id);
      
      return {
        success: true,
        data: updatedMember.data,
        message: 'Member rejected successfully'
      };
    } catch (error) {
      console.error('Error rejecting member:', error);
      throw new Error('Failed to reject member');
    }
  }

  // Activate member
  async activateMember(id) {
    try {
      // Check if member exists
      const existingMember = await this.getMemberById(id);
      if (!existingMember.success) {
        return existingMember;
      }

      if (existingMember.data.status === 'active') {
        return {
          success: false,
          error: 'Member is already active'
        };
      }

      // Update member status to active
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        status: 'active',
        updatedAt: serverTimestamp()
      });
      
      // Get updated member
      const updatedMember = await this.getMemberById(id);
      
      return {
        success: true,
        data: updatedMember.data,
        message: 'Member activated successfully'
      };
    } catch (error) {
      console.error('Error activating member:', error);
      throw new Error('Failed to activate member');
    }
  }

  // Deactivate member
  async deactivateMember(id) {
    try {
      // Check if member exists
      const existingMember = await this.getMemberById(id);
      if (!existingMember.success) {
        return existingMember;
      }

      if (existingMember.data.status === 'inactive') {
        return {
          success: false,
          error: 'Member is already inactive'
        };
      }

      // Update member status to inactive
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        status: 'inactive',
        updatedAt: serverTimestamp()
      });
      
      // Get updated member
      const updatedMember = await this.getMemberById(id);
      
      return {
        success: true,
        data: updatedMember.data,
        message: 'Member deactivated successfully'
      };
    } catch (error) {
      console.error('Error deactivating member:', error);
      throw new Error('Failed to deactivate member');
    }
  }

  // Bulk operations
  async bulkUpdateMembers(memberIds, updateData) {
    try {
      const results = [];
      
      for (const id of memberIds) {
        const result = await this.updateMember(id, updateData);
        results.push({ id, ...result });
      }
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      return {
        success: true,
        message: `Bulk update completed: ${successCount} successful, ${failureCount} failed`,
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount
        }
      };
    } catch (error) {
      console.error('Error in bulk update:', error);
      throw new Error('Failed to perform bulk update');
    }
  }

  // Get member statistics
  async getMemberStats() {
    try {
      const [allMembers, pendingMembers, activeMembers, inactiveMembers] = await Promise.all([
        this.getAllMembers({}),
        this.getPendingMembers(),
        this.getActiveMembers(),
        this.getInactiveMembers()
      ]);

      return {
        success: true,
        data: {
          total: allMembers.count,
          pending: pendingMembers.count,
          active: activeMembers.count,
          inactive: inactiveMembers.count
        }
      };
    } catch (error) {
      console.error('Error getting member stats:', error);
      throw new Error('Failed to fetch member statistics');
    }
  }
}

module.exports = new MemberService();
