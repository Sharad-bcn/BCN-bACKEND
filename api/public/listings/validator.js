const { _validate, $joi } = require('express-tools')

module.exports.fetchAll = (req, res, next) =>
  _validate.joi(req, res, next, {
    city: $joi.string(),
    filter: $joi.string(),
    limit: $joi.number(),
    pageNo: $joi.number(),
    category: $joi.string().allow(null, ''),
    subCategory: $joi.string().allow(null, '')
  })

module.exports.searchListings = (req, res, next) =>
  _validate.joi(req, res, next, {
    searchQuery: $joi.string().allow(null, '').trim(),
    city: $joi.string(),
    filter: $joi.string(),
    limit: $joi.number(),
    pageNo: $joi.number()
  })

module.exports.fetch = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string()
  })

module.exports.fetchBusinessListings = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string()
  })

module.exports.updateViews = (req, res, next) =>
  _validate.joi(req, res, next, {
    fkListingId: $joi.string()
  })
