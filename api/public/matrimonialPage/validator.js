// const { _validate, $joi } = require('express-tools');

// // Validator for matrimonial form POST request
// const matrimonialValidator = [
//   _validate.joi(
//     {
//       name: $joi.string().required().messages({
//         'string.empty': 'Name is required',
//       }),
//       email: $joi.string().email().required().messages({
//         'string.email': 'Invalid email',
//       }),
//       gender: $joi.string().valid('male', 'female').required().messages({
//         'any.only': 'Gender must be male or female',
//       }),
//       dob: $joi.date().required().messages({
//         'date.base': 'Date of birth must be a valid date',
//       }),
//       contact: $joi.string().pattern(/^[0-9]{10}$/).required().messages({
//         'string.pattern.base': 'Contact must be a valid phone number',
//       }),
//       address: $joi.string().optional(),
//       gotra: $joi.string().optional(),
//       district_city: $joi.string().optional(),
//       education: $joi.string().optional(),
//       jobProfile: $joi.string().optional(),
//       income: $joi.string().optional(),
//       maritalStatus: $joi.string().optional(),
//       fatherName: $joi.string().optional(),
//       fatherProfession: $joi.string().optional(),
//       motherName: $joi.string().optional(),
//       motherProfession: $joi.string().optional(),
//     },
//     { reqBody: true }
//   ),
// ];

// // Validator for search query
// const searchValidator = [
//   _validate.joi(
//     {
//       gender: $joi.string().valid('male', 'female').optional().messages({
//         'any.only': 'Invalid gender value',
//       }),
//       minAge: $joi.number().integer().min(18).optional().messages({
//         'number.min': 'minAge must be an integer greater than or equal to 18',
//       }),
//       maxAge: $joi.number().integer().min(18).optional().messages({
//         'number.min': 'maxAge must be an integer greater than or equal to 18',
//       }),
//       location: $joi.string().optional().messages({
//         'string.base': 'Location must be a string',
//       }),
//     },
//     { reqQuery: true }
//   ),
// ];

// // Custom error handler middleware
// const handleValidationErrors = (req, res, next) => {
//   if (req._validationErrors) {
//     return res.status(400).json({ errors: req._validationErrors });
//   }
//   next();
// };

// module.exports = { matrimonialValidator, searchValidator, handleValidationErrors };
const { $joi } = require('express-tools'); // Validation library
const express = require('express');
const multer = require('multer');
const path = require('path');
const $router = express.Router();
module.exports = $router;
// Multer setup for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});
// Custom validation middleware
const validate = (schema, property) => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property]);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        next();
    };
};
// Joi schemas for validation
const saveMatrimonialSchema = $joi.object({
    fullName: $joi.string().required(),
    email: $joi.string().email().required(),
    address: $joi.string().required(),
    gender: $joi.string().valid('male', 'female').required(),
    dateOfBirth: $joi.date().required(),
    gotra: $joi.string().optional(),
    districtCity: $joi.string().optional(),
    educationQualification: $joi.string().optional(),
    jobProfile: $joi.string().optional(),
    annualIncome: $joi.number().optional(),
    maritalStatus: $joi.string().optional(),
    fatherName: $joi.string().optional(),
    fatherProfession: $joi.string().optional(),
    motherName: $joi.string().optional(),
    motherProfession: $joi.string().optional(),
    contactNumber: $joi.string().required(),
    hobbies: $joi.array().items($joi.string()).optional(),
    bloodGroup: $joi.string().valid('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-').optional(),
    height: $joi.number().positive().optional(),
    photo: $joi.object().optional(), // Add validation for photo (optional)
    cv: $joi.object().optional(),
});
const searchQuerySchema = $joi.object({
    gender: $joi.string().valid('male', 'female').optional(),
    minAge: $joi.number().integer().optional(),
    maxAge: $joi.number().integer().optional(),
    districtCity: $joi.string().optional(),
    bloodGroup: $joi.string().valid('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-').optional(),
    height: $joi.number().positive().optional(),
    hobbies: $joi.string().optional(),
});
const fileUploadSchema = $joi.object({
    file: $joi.object().required().messages({
        "any.required": "A file must be uploaded!"
    }),
});
const profileIdSchema = $joi.object({
    id: $joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // MongoDB ObjectID format validation
});
// Routes with validation middleware
/**
 * POST - Save matrimonial profile
 */
$router.post(
    '/save',
    upload.fields([
      { name: 'photo', maxCount: 1 }, // Profile photo
      { name: 'cv', maxCount: 1 },    // Resume PDF
    ]),
    validate(saveMatrimonialSchema, 'body'),
    (req, res) => {
        // Placeholder for actual save logic
        res.status(201).json({
            message: 'Matrimonial profile saved successfully!',
            uploadedFiles: req.files
        });
    }
);
/**
 * POST - Upload PDF or Photo
 */
$router.post(
    '/upload',
    upload.single('file'),
    (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded!' });
        }
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
        if (!allowedExtensions.includes(fileExtension)) {
            return res.status(400).json({ message: 'Only PDF or image files are allowed!' });
        }
        next();
    },
    validate(fileUploadSchema, 'file'),
    (req, res) => {
        res.status(201).json({
            message: 'File uploaded successfully!',
            filePath: req.file.path,
            originalName: req.file.originalname,
        });
    }
);
/**
 * GET - Search matrimonial profiles
 */
$router.get(
    '/search',
    validate(searchQuerySchema, 'query'),
    (req, res) => {
        // Placeholder for actual search logic
        res.status(200).json({ message: 'Search results returned successfully!' });
    }
);
/**
 * GET - Fetch matrimonial profile by ID
 */
$router.get(
    '/profile/:id',
    validate(profileIdSchema, 'params'),
    (req, res) => {
        // Placeholder for fetching profile logic
        res.status(200).json({
            message: `Profile with ID: ${req.params.id} fetched successfully!`
        });
    }
);
/**
 * PUT - Update matrimonial profile by ID
 */
$router.put(
    '/update/:id',
    upload.single('photo'),
    validate(profileIdSchema, 'params'),
    validate(saveMatrimonialSchema, 'body'),
    (req, res) => {
        // Placeholder for update logic
        res.status(200).json({
            message: `Profile with ID: ${req.params.id} updated successfully!`,
        });
    }
);
/**
 * DELETE - Delete matrimonial profile by ID
 */
$router.delete(
    '/delete/:id',
    validate(profileIdSchema, 'params'),
    (req, res) => {
        // Placeholder for delete logic
        res.status(200).json({
            message: `Profile with ID: ${req.params.id} deleted successfully!`,
        });
    }
);






