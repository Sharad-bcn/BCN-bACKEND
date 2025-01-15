const { $joi } = require('express-tools'); // Validation library

// Joi schema for validating matrimonial form data
module.exports.validateMatrimonialForm = (formData) => {
  const schema = $joi.object({
    name: $joi.string().required().messages({
      'string.empty': 'Full name is required!',
    }),
    contact: $joi.string().pattern(/^[\d]{10}$/).required().messages({
      'string.pattern.base': 'Mobile number must be 10 digits!',
    }),
    email: $joi.string().email().required().messages({
      'string.email': 'Invalid email format!',
    }),
    pinCode: $joi.string().pattern(/^[\d]{6}$/).messages({
      'string.pattern.base': 'Pin code must be 6 digits!',
    }),
    dob: $joi.date().required().messages({
      'date.base': 'Date of birth is required!',
    }),
    address: $joi.string().optional(),
    gender: $joi.string().valid('male', 'female').required().messages({
      'any.only': 'Gender must be either male or female!',
    }),
    photo: $joi.any().required(), // Update this for photo validation
    declaration: $joi.boolean().default(true),
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
    hobbies: $joi.array().items($joi.string()).optional(),
    bloodGroup: $joi.string()
      .valid('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')
      .optional(),
    height: $joi.number().positive().optional(),
  });

  const { error } = schema.validate(formData, { abortEarly: false });

  const errors = error
    ? error.details.reduce((acc, curr) => {
        acc[curr.context.key] = curr.message;
        return acc;
      }, {})
    : {};

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
