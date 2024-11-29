const { _validate, $joi } = require('express-tools')

module.exports.fetchBaseFields = (req, res, next) =>
  _validate.joi(req, res, next, {
    city: $joi.string(),
    filter: $joi.string(),
    limit: $joi.number(),
    pageNo: $joi.number(),
    category: $joi.string().allow(null, ''),
    subCategory: $joi.string().allow(null, '')
  })

module.exports.searchFields = (req, res, next) =>
  _validate.joi(req, res, next, {
    searchQuery: $joi.string().allow(null, '').trim(),
    city: $joi.string(),
    filter: $joi.string(),
    limit: $joi.number(),
    pageNo: $joi.number()
  })
