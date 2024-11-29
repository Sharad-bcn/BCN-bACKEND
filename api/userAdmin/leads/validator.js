const { _validate, $joi } = require('express-tools')

module.exports.fetchAll = (req, res, next) =>
  _validate.joi(req, res, next, {
    fkListingId: $joi.string()
  })
