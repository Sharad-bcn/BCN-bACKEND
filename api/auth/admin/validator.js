const { _validate, $joi } = require('express-tools')

module.exports.logIn = (req, res, next) =>
  _validate.joi(req, res, next, {
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999),
    pin: $joi.string()
  })

module.exports.getUserAdmin = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string()
  })
