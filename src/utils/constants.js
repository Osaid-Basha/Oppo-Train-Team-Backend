// Application constants

const CONSTANTS = {
    // User roles
    USER_ROLES: {
      ADMIN: 'admin',
      MEMBER: 'member',
      USER: 'user'
    },
  
    // Membership statuses
    MEMBERSHIP_STATUS: {
      PENDING: 'pending',
      APPROVED: 'approved',
      REJECTED: 'rejected',
      SUSPENDED: 'suspended'
    },
  
    // Year of study options
    YEAR_OF_STUDY: {
      FIRST: '1',
      SECOND: '2',
      THIRD: '3',
      FOURTH: '4',
      FIFTH: '5'
    },
  
    // HTTP Status codes
    HTTP_STATUS: {
      OK: 200,
      CREATED: 201,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CONFLICT: 409,
      UNPROCESSABLE_ENTITY: 422,
      INTERNAL_SERVER_ERROR: 500
    },
  
    // Rate limiting
    RATE_LIMIT: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100, // Max requests per window
      AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      AUTH_MAX_REQUESTS: 5 // Max auth attempts per window
    },
  
    // Pagination defaults
    PAGINATION: {
      DEFAULT_PAGE: 1,
      DEFAULT_LIMIT: 10,
      MAX_LIMIT: 100
    },
  
    // File upload limits
    FILE_LIMITS: {
      MAX_SIZE: 10 * 1024 * 1024, // 10MB
      ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf']
    },
  
    // Email types
    EMAIL_TYPES: {
      APPROVAL: 'approval',
      REJECTION: 'rejection',
      NOTIFICATION: 'notification',
      PASSWORD_RESET: 'password_reset'
    },
  
    // Database collections
    COLLECTIONS: {
      USERS: 'users',
      EVENTS: 'events',
      RESOURCES: 'resources',
      NOTIFICATIONS: 'notifications'
    },
  
    // Error messages
    ERROR_MESSAGES: {
      INVALID_TOKEN: 'Invalid or expired token',
      USER_NOT_FOUND: 'User not found',
      EMAIL_ALREADY_EXISTS: 'Email already exists',
      STUDENT_ID_EXISTS: 'Student ID already registered',
      INVALID_CREDENTIALS: 'Invalid email or password',
      ACCESS_DENIED: 'Access denied',
      ADMIN_REQUIRED: 'Admin access required',
      VALIDATION_FAILED: 'Validation failed',
      INTERNAL_ERROR: 'Internal server error',
      RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later'
    },
  
    // Success messages
    SUCCESS_MESSAGES: {
      USER_REGISTERED: 'User registered successfully',
      USER_UPDATED: 'User updated successfully',
      USER_DELETED: 'User deleted successfully',
      LOGIN_SUCCESS: 'Login successful',
      LOGOUT_SUCCESS: 'Logout successful',
      MEMBER_APPROVED: 'Member approved successfully',
      MEMBER_REJECTED: 'Member rejected successfully',
      EMAIL_SENT: 'Email sent successfully'
    },
  
    // Firebase Auth error codes
    FIREBASE_ERRORS: {
      EMAIL_ALREADY_EXISTS: 'auth/email-already-exists',
      INVALID_EMAIL: 'auth/invalid-email',
      WEAK_PASSWORD: 'auth/weak-password',
      USER_NOT_FOUND: 'auth/user-not-found',
      WRONG_PASSWORD: 'auth/wrong-password',
      TOO_MANY_REQUESTS: 'auth/too-many-requests'
    },
  
    // Validation rules
    VALIDATION: {
      EMAIL_MAX_LENGTH: 254,
      PASSWORD_MIN_LENGTH: 6,
      NAME_MIN_LENGTH: 2,
      NAME_MAX_LENGTH: 100,
      STUDENT_ID_MAX_LENGTH: 20,
      PHONE_MIN_LENGTH: 10,
      PHONE_MAX_LENGTH: 15
    },
  
    // App configuration
    APP_CONFIG: {
      NAME: 'AIAS An-Najah Chapter',
      VERSION: '1.0.0',
      SUPPORT_EMAIL: 'admin@aias.najah.edu',
      WEBSITE: 'https://aias.najah.edu'
    }
  };
  
  module.exports = CONSTANTS;