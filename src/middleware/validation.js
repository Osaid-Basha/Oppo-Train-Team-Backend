const { body, param, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('student_id')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Student ID is required'),
  body('university')
    .trim()
    .isLength({ min: 1 })
    .withMessage('University is required'),
  body('year_of_study')
    .isIn(['1', '2', '3', '4', '5'])
    .withMessage('Year of study must be 1-5'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// User ID parameter validation
const validateUserId = [
  param('id')
    .isLength({ min: 1 })
    .withMessage('User ID is required'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateUserId,
  handleValidationErrors
};