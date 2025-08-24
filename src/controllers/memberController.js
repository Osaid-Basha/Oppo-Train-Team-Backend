const memberService = require('../services/memberService'); // Real Firebase service
// const memberService = require('../services/memberServiceMock'); // Mock service for testing

class MemberController {
  // Get all members with filtering and pagination
  async getAllMembers(req, res) {
    try {
      const { 
        status, 
        search, 
        limit, 
        startAfter, 
        sortBy, 
        sortOrder 
      } = req.query;

      const options = {
        status,
        search,
        limit: limit ? parseInt(limit) : 50,
        startAfter,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc'
      };

      const result = await memberService.getAllMembers(options);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Members retrieved successfully',
          data: result.data,
          count: result.count,
          hasMore: result.hasMore
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Controller error - getAllMembers:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get member by ID
  async getMemberById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Member ID is required'
        });
      }

      const result = await memberService.getMemberById(id);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Member retrieved successfully',
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Controller error - getMemberById:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Create new member
  async createMember(req, res) {
    try {
      const memberData = req.body;
      
      if (!memberData || Object.keys(memberData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Member data is required'
        });
      }

      const result = await memberService.createMember(memberData);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          message: result.message,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: result.errors
        });
      }
    } catch (error) {
      console.error('Controller error - createMember:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Update member
  async updateMember(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Member ID is required'
        });
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Update data is required'
        });
      }

      const result = await memberService.updateMember(id, updateData);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data
        });
      } else {
        if (result.error === 'Member not found') {
          res.status(404).json({
            success: false,
            message: result.error
          });
        } else {
          res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: result.errors
          });
        }
      }
    } catch (error) {
      console.error('Controller error - updateMember:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Delete member
  async deleteMember(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Member ID is required'
        });
      }

      const result = await memberService.deleteMember(id);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Controller error - deleteMember:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get pending members
  async getPendingMembers(req, res) {
    try {
      const result = await memberService.getPendingMembers();
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Pending members retrieved successfully',
          data: result.data,
          count: result.count
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Controller error - getPendingMembers:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get active members
  async getActiveMembers(req, res) {
    try {
      const result = await memberService.getActiveMembers();
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Active members retrieved successfully',
          data: result.data,
          count: result.count
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Controller error - getActiveMembers:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get inactive members
  async getInactiveMembers(req, res) {
    try {
      const result = await memberService.getInactiveMembers();
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Inactive members retrieved successfully',
          data: result.data,
          count: result.count
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Controller error - getInactiveMembers:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Approve member
  async approveMember(req, res) {
    try {
      const { id } = req.params;
      const { approvedBy } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Member ID is required'
        });
      }

      if (!approvedBy) {
        return res.status(400).json({
          success: false,
          message: 'Approver information is required'
        });
      }

      const result = await memberService.approveMember(id, approvedBy);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Controller error - approveMember:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Reject member
  async rejectMember(req, res) {
    try {
      const { id } = req.params;
      const { rejectedBy } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Member ID is required'
        });
      }

      if (!rejectedBy) {
        return res.status(400).json({
          success: false,
          message: 'Rejector information is required'
        });
      }

      const result = await memberService.rejectMember(id, rejectedBy);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Controller error - rejectMember:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Activate member
  async activateMember(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Member ID is required'
        });
      }

      const result = await memberService.activateMember(id);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Controller error - activateMember:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Deactivate member
  async deactivateMember(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Member ID is required'
        });
      }

      const result = await memberService.deactivateMember(id);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Controller error - deactivateMember:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Bulk update members
  async bulkUpdateMembers(req, res) {
    try {
      const { memberIds, updateData } = req.body;
      
      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Member IDs array is required'
        });
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Update data is required'
        });
      }

      const result = await memberService.bulkUpdateMembers(memberIds, updateData);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          summary: result.summary,
          results: result.results
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Controller error - bulkUpdateMembers:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get member statistics
  async getMemberStats(req, res) {
    try {
      const result = await memberService.getMemberStats();
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Member statistics retrieved successfully',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Controller error - getMemberStats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = new MemberController();
