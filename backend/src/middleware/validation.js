const { body, validationResult } = require('express-validator');

const validateUser = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 50 })
    .withMessage('City name cannot exceed 50 characters'),
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ max: 50 })
    .withMessage('State name cannot exceed 50 characters'),
  body('address.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required')
    .matches(/^[0-9]{5,6}$/)
    .withMessage('Please provide a valid 5-6 digit zip code'),
  body('address.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map((err) => err.msg),
    });
  }
  next();
};

module.exports = { validateUser, validate };
