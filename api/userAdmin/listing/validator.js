const { _validate, $joi } = require('express-tools')

module.exports.create = (req, res, next) =>
  _validate.joi(req, res, next, {
    listingName: $joi.string().min(3).max(60),
    images: $joi.array().items($joi.string().allow(null, '')),
    description: $joi.string().min(2),
    contactPerson: $joi.string().min(3).max(60),
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999),
    fkBusinessId: $joi.string()
  })

module.exports.update = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string(),
    listingName: $joi.string().min(3).max(60),
    images: $joi.array().items($joi.string().allow(null, '')),
    description: $joi.string().min(2),
    contactPerson: $joi.string().min(3).max(60),
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999),
    businessName: $joi.string().min(3),
    fkBusinessId: $joi.string()
  })

module.exports.fetch = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string()
  })

module.exports.fetchAll = (req, res, next) =>
  _validate.joi(req, res, next, {
    fkBusinessId: $joi.string(),
    searchQuery: $joi.string().allow(null, ''),
    perPage: $joi.number(),
    pageNo: $joi.number().min(1),
    filter: $joi.string().allow(null, '')
  })

module.exports.delete = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string()
  })

module.exports.toggleListingStatus = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string()
  })

module.exports.fetchListingsCount = (req, res, next) =>
  _validate.joi(req, res, next, {
    fkBusinessId: $joi.string()
  })
