const { _validate, $joi } = require('express-tools')

module.exports.create = (req, res, next) =>
  _validate.joi(req, res, next, {
    notification: $joi.string(),
    redirect: $joi.string().allow(null, '')
  })

module.exports.fetchAll = (req, res, next) =>
  _validate.joi(req, res, next, {
    perPage: $joi.number(),
    pageNo: $joi.number().min(1),
    filter: $joi.string().valid('All', 'New', 'Read').trim()
  })

module.exports.markAsRead = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string()
  })

module.exports.delete = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string()
  })
