const { _validate, $joi } = require('express-tools')

module.exports.create = (req, res, next) =>
  _validate.joi(req, res, next, {
    plan: $joi.string().valid('Plan 0', 'Plan A', 'Plan B', 'Plan C').trim(),
    firstName: $joi.string().min(3).max(30).trim(),
    lastName: $joi.string().min(2).max(30).trim(),
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999),
    email: $joi
      .string()
      .email({
        minDomainSegments: 2, // Ensures at least two domain segments (e.g., example.com)
        tlds: { allow: ['com', 'net', 'org', 'edu', 'in'] } // Specify valid top-level domains
      })
      .trim()
      .allow(null, ''),
    fkRefId: $joi.string().allow(null, '').trim(),
    gender: $joi.string().valid('male', 'female', 'other', 'Male', 'Female', 'Other', 'MALE', 'FEMALE', 'OTHER').trim(),
    address: $joi.string().min(3).trim(),
    state: $joi.string().trim(),
    city: $joi.string().trim(),
    pinCode: $joi.number().integer().min(100000).max(999999).allow(null, ''),
    pin: $joi.string(),
    logo: $joi.string().allow(null, ''),
    
    // New fields validation
    referredBy: $joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null, ''), // Validates ObjectId format if referredBy is provided
    rewards: $joi.number().min(0).default(0) // Rewards should be a number and default to 0 if not provided
  })

module.exports.blockUser = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string()
  })

module.exports.fetchAll = (req, res, next) =>
  _validate.joi(req, res, next, {
    city: $joi.string().allow(null, ''),
    state: $joi.string().allow(null, ''),
    searchQuery: $joi.string().allow(null, ''),
    limit: $joi.number(),
    pageNo: $joi.number()
  })

module.exports.updateApprovalStatus = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string(),
    isApproved: $joi.boolean(),
    rejectionMessage: $joi.string().allow(null, '')
  })

module.exports.fetchNewlyCreated = (req, res, next) =>
  _validate.joi(req, res, next, {
    perPage: $joi.number(),
    pageNo: $joi.number().min(1)
  })
