const { _validate, $joi } = require('express-tools')

module.exports.update = (req, res, next) =>
  _validate.joi(req, res, next, {
    firstName: $joi.string().min(3).max(30),
    lastName: $joi.string().min(2).max(30),
    gender: $joi.string().valid('male', 'female', 'other', 'Male', 'Female', 'Other', 'MALE', 'FEMALE', 'OTHER').trim(),
    email: $joi
      .string()
      .email({
        minDomainSegments: 2, // Ensures at least two domain segments (e.g., example.com)
        tlds: { allow: ['com', 'net', 'org', 'edu', 'in'] } // Specify valid top-level domains
      })
      .trim()
      .allow(null, ''),
    address: $joi.string().min(3),
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999),
    state: $joi.string(),
    city: $joi.string(),
    pinCode: $joi.number().integer().min(100000).max(999999).allow(null, ''),
    fkRefId: $joi.string().allow(null, ''),
    logo: $joi.string().allow(null, '')
  })

module.exports.changePin = (req, res, next) =>
  _validate.joi(req, res, next, {
    oldPin: $joi.string(),
    newPin: $joi.string()
  })

module.exports.renewPlan = (req, res, next) =>
  _validate.joi(req, res, next, {
    plan: $joi.string().valid('Plan A', 'Plan B', 'Plan C').trim(),
    razorPayOrderId: $joi.string(),
    razorPayPaymentId: $joi.string(),
    razorPaySignature: $joi.string()
  })
