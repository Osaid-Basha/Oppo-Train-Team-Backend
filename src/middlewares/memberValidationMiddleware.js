const Member = require('../models/Member');

// Validate member creation data
const validateMemberCreation = (req, res, next) => {
  try {
    const validation = Member.validate(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    next();
  } catch (error) {
    console.error('Validation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
};

// Validate member update data
const validateMemberUpdate = (req, res, next) => {
  try {
    const validation = Member.validateUpdate(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    next();
  } catch (error) {
    console.error('Validation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
};

// Validate member ID parameter
const validateMemberId = (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || id.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required'
      });
    }
    
    // Check if ID is a valid Firestore document ID format
    if (id.length < 3 || id.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID format'
      });
    }
    
    next();
  } catch (error) {
    console.error('Validation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
};

// Validate approval/rejection data
const validateApprovalData = (req, res, next) => {
  try {
    const { approvedBy, rejectedBy } = req.body;
    
    if (!approvedBy && !rejectedBy) {
      return res.status(400).json({
        success: false,
        message: 'Approver or rejector information is required'
      });
    }
    
    if (approvedBy && typeof approvedBy !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Approver must be a string'
      });
    }
    
    if (rejectedBy && typeof rejectedBy !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Rejector must be a string'
      });
    }
    
    next();
  } catch (error) {
    console.error('Validation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
};

// Validate bulk update data
const validateBulkUpdate = (req, res, next) => {
  try {
    const { memberIds, updateData } = req.body;
    
    if (!memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({
        success: false,
        message: 'Member IDs must be an array'
      });
    }
    
    if (memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Member IDs array cannot be empty'
      });
    }
    
    if (memberIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update more than 100 members at once'
      });
    }
    
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data is required'
      });
    }
    
    // Validate each member ID
    for (const id of memberIds) {
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid member ID in array'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Validation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
};

// Validate query parameters for filtering
const validateQueryParams = (req, res, next) => {
  try {
    const { status, limit, sortBy, sortOrder } = req.query;
    
    // Validate status
    if (status && !['all', 'pending', 'active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status parameter. Must be: all, pending, active, or inactive'
      });
    }
    
    // Validate limit
    if (limit) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Limit must be a number between 1 and 100'
        });
      }
    }
    
    // Validate sortBy
    if (sortBy && !['firstName', 'lastName', 'email', 'studentNumber', 'status', 'createdAt', 'updatedAt'].includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sortBy parameter'
      });
    }
    
    // Validate sortOrder
    if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sortOrder parameter. Must be: asc or desc'
      });
    }
    
    next();
  } catch (error) {
    console.error('Validation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
};

module.exports = {
  validateMemberCreation,
  validateMemberUpdate,
  validateMemberId,
  validateApprovalData,
  validateBulkUpdate,
  validateQueryParams
};
