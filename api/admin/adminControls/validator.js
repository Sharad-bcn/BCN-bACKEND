const { _validate, $joi } = require('express-tools')

module.exports.create = (req, res, next) =>
  _validate.joi(req, res, next, {
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
    pin: $joi.string(),
    profilePic: $joi.string().allow(null, '')
  })

module.exports.update = (req, res, next) =>
  _validate.joi(req, res, next, {
    firstName: $joi.string().min(3).max(30),
    lastName: $joi.string().min(2).max(30),
    email: $joi
      .string()
      .email({
        minDomainSegments: 2, // Ensures at least two domain segments (e.g., example.com)
        tlds: { allow: ['com', 'net', 'org', 'edu', 'in'] } // Specify valid top-level domains
      })
      .trim()
      .allow(null, ''),
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999),
    profilePic: $joi.string().allow(null, '')
  })

module.exports.changePin = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string().allow(null, ''),
    oldPin: $joi.string(),
    newPin: $joi.string()
  })

module.exports.fetchAll = (req, res, next) =>
  _validate.joi(req, res, next, {
    searchQuery: $joi.string().allow(null, ''),
    limit: $joi.number(),
    pageNo: $joi.number()
  })

module.exports.delete = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string()
  })
