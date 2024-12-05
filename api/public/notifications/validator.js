const { _validate, $joi } = require('express-tools')

module.exports.create = (req, res, next) =>
  _validate.joi(req, res, next, {
    notification: $joi.string(),
    fkUserId: $joi.string(),
    redirect: $joi.string().allow(null, '')
  })
