const { _validate, $joi } = require('express-tools')

module.exports.create = (req, res, next) =>
  _validate.joi(req, res, next, {
    contactPerson: $joi.string().min(3).max(60),
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999),
    email: $joi.string().email({
      minDomainSegments: 2, // Ensures at least two domain segments (e.g., example.com)
      tlds: { allow: ['com', 'net', 'org', 'edu', 'in'] } // Specify valid top-level domains
    }),
    query: $joi.string().allow('', null),
    state: $joi.string(),
    city: $joi.string(),
    fkListingId: $joi.string()
  })
