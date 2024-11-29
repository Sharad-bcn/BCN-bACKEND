const { _validate, $joi } = require('express-tools')

module.exports.fetchSubCategoryViaCategory = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string()
  })
