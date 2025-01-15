const { $joi } = require('express-tools');
const express = require('express');

const $router = express.Router();
module.exports = $router;

// Custom validation middleware
const validate = (schema, property) => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property]);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        next();
    };
};

// Joi schemas
const saveMatrimonialSchema = $joi.object({
    name: $joi.string().required(),
    email: $joi.string().email().required(),
    address: $joi.string().required(),
    gender: $joi.string().valid('male', 'female').required(),
    dob: $joi.date().required(),
    gotra: $joi.string(),
    district_city: $joi.string(),
    education: $joi.string(),
    jobProfile: $joi.string(),
    income: $joi.number(),
    maritalStatus: $joi.string(),
    fatherName: $joi.string(),
    fatherProfession: $joi.string(),
    motherName: $joi.string(),
    motherProfession: $joi.string(),
    contact: $joi.string().required(),
});

const searchQuerySchema = $joi.object({
    gender: $joi.string(),
    minAge: $joi.number(),
    maxAge: $joi.number(),
    location: $joi.string(),
});

const uploadPDFSchema = $joi.object({
    file: $joi.object().required().messages({
        "any.required": "A PDF file must be uploaded!" // This is the correct way to apply the error message
    })
});

// Routes with validation middleware
$router.post('/save', validate(saveMatrimonialSchema, 'body'), (req, res) => {
    res.send('Matrimonial data saved successfully');
});

$router.post('/upload-pdf', (req, res, next) => {
    if (!req.file) {
      return res.status(400).send('No PDF file uploaded!');
    }
    next();
  }, validate(uploadPDFSchema, 'file'), (req, res) => {
    res.send('PDF file uploaded successfully');
  });

$router.get('/search', validate(searchQuerySchema, 'query'), (req, res) => {
    res.send('Search results returned successfully');
});
