const { _validate, $joi } = require('express-tools')

module.exports.create = (req, res, next) =>
  _validate.joi(req, res, next, {
    razorPayOrderId: $joi.string().allow(null, ''),
    razorPayPaymentId: $joi.string().allow(null, ''),
    razorPaySignature: $joi.string().allow(null, ''),
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
    logo: $joi.string().allow(null, '')
  })

module.exports.fetch = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string()
  })

module.exports.part2Validation = (req, res, next) =>
  _validate.joi(req, res, next, {
    email: $joi.string().allow(null, '').trim(),
    fkRefId: $joi.string().allow(null, '').trim(),
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999)
  })

module.exports.forgotPin = (req, res, next) =>
  _validate.joi(req, res, next, {
    pin: $joi.string(),
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999)
  })

module.exports.paymentCheckOut = (req, res, next) =>
  _validate.joi(req, res, next, {
    amount: $joi.number().min(0)
  })

module.exports.paymentVerification = (req, res, next) =>
  _validate.joi(req, res, next, {
    razorPayOrderId: $joi.string(),
    razorPayPaymentId: $joi.string(),
    razorPaySignature: $joi.string()
  })

module.exports.validPayment = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string()
  })
