// Helper functions for common operations

const helpers = {
    // Format date to readable string
    formatDate(timestamp) {
      if (!timestamp) return null;
      
      let date;
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        // Firestore timestamp
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  
    // Sanitize user input
    sanitizeInput(input) {
      if (typeof input !== 'string') return input;
      
      return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .substring(0, 1000); // Limit length
    },
  
    // Generate random string
    generateRandomString(length = 10) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },
  
    // Validate email format
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
  
    // Validate phone number (basic)
    isValidPhone(phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(phone.replace(/[-\s]/g, ''));
    },
  
    // Create pagination info
    createPagination(totalItems, page, limit) {
      const totalPages = Math.ceil(totalItems / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;
      
      return {
        currentPage: page,
        totalItems,
        totalPages,
        hasNext,
        hasPrev,
        itemsPerPage: limit
      };
    },
  
    // Filter sensitive data from user object
    filterUserData(user, includePrivate = false) {
      const {
        password,
        firebase_uid,
        ...filteredUser
      } = user;
  
      if (!includePrivate) {
        const {
          phone,
          student_id,
          ...publicData
        } = filteredUser;
        return publicData;
      }
  
      return filteredUser;
    },
  
    // Convert Firestore timestamp to ISO string
    timestampToISOString(timestamp) {
      if (!timestamp) return null;
      
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
      }
      
      return new Date(timestamp).toISOString();
    },
  
    // Create success response
    successResponse(message, data = null) {
      const response = { success: true, message };
      if (data) response.data = data;
      return response;
    },
  
    // Create error response
    errorResponse(message, details = null) {
      const response = { success: false, error: message };
      if (details) response.details = details;
      return response;
    },
  
    // Capitalize first letter
    capitalizeFirst(str) {
      if (!str) return str;
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
  
    // Sleep/delay function
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  };
  
  module.exports = helpers;