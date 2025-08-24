const Member = require('../models/Member');

class MemberServiceMock {
  constructor() {
    this.members = new Map();
    this.nextId = 1;
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

      let members = Array.from(this.members.values());

      // Apply status filter
      if (status && status !== 'all') {
        members = members.filter(member => member.status === status);
      }

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        members = members.filter(member => 
          member.firstName.toLowerCase().includes(searchLower) ||
          member.lastName.toLowerCase().includes(searchLower) ||
          member.email.toLowerCase().includes(searchLower) ||
          member.studentNumber.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      members.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (sortOrder === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });

      // Apply pagination
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
      const member = this.members.get(id);
      
      if (!member) {
        return {
          success: false,
          error: 'Member not found'
        };
      }
      
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
      const member = Array.from(this.members.values()).find(m => m.email === email.toLowerCase());
      
      if (!member) {
        return {
          success: false,
          error: 'Member not found'
        };
      }
      
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
      const member = Array.from(this.members.values()).find(m => m.studentNumber === studentNumber);
      
      if (!member) {
        return {
          success: false,
          error: 'Member not found'
        };
      }
      
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
      const id = `mock_${this.nextId++}`;
      member.id = id;
      
      // Add to mock storage
      this.members.set(id, member);
      
      return {
        success: true,
        data: member,
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

      // Update member
      const member = existingMember.data;
      Object.assign(member, updateData);
      member.updatedAt = new Date();
      
      // Update in mock storage
      this.members.set(id, member);
      
      return {
        success: true,
        data: member,
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

      // Delete from mock storage
      this.members.delete(id);
      
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
      const members = Array.from(this.members.values()).filter(m => m.status === 'pending');
      
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
      const members = Array.from(this.members.values()).filter(m => m.status === 'active');
      
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
      const members = Array.from(this.members.values()).filter(m => m.status === 'inactive');
      
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
      const member = existingMember.data;
      member.approve(approvedBy);
      
      // Update in mock storage
      this.members.set(id, member);
      
      return {
        success: true,
        data: member,
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
      const member = existingMember.data;
      member.reject(rejectedBy);
      
      // Update in mock storage
      this.members.set(id, member);
      
      return {
        success: true,
        data: member,
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
      const member = existingMember.data;
      member.activate();
      
      // Update in mock storage
      this.members.set(id, member);
      
      return {
        success: true,
        data: member,
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
      const member = existingMember.data;
      member.deactivate();
      
      // Update in mock storage
      this.members.set(id, member);
      
      return {
        success: true,
        data: member,
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

module.exports = new MemberServiceMock();
