const { _validate, $joi } = require('express-tools')

module.exports.logIn = (req, res, next) =>
  _validate.joi(req, res, next, {
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999),
    pin: $joi.string()
  })

module.exports.requestOTP = (req, res, next) =>
  _validate.joi(req, res, next, {
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999)
  })

module.exports.verifyOTP = (req, res, next) =>
  _validate.joi(req, res, next, {
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999),
    otp: $joi.number().integer().min(1000).max(9999)
  })

module.exports.resetPinOTP = (req, res, next) =>
  _validate.joi(req, res, next, {
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999)
  })

module.exports.verifyResetPinOTP = (req, res, next) =>
  _validate.joi(req, res, next, {
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999),
    otp: $joi.number().integer().min(1000).max(9999)
  })
