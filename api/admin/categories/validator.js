const { _validate, $joi } = require('express-tools')

module.exports.create = (req, res, next) =>
  _validate.joi(req, res, next, {
    category: $joi.string().min(3).max(30).trim(),
    image: $joi.string().allow(null, ''),
    subCategories: $joi
      .array()
      .items(
        $joi.object({
          subCategory: $joi.string().min(3).max(30).trim(),
          image: $joi.string().allow(null, '')
        })
      )
      .allow(null, '')
  })

module.exports.update = (req, res, next) =>
  _validate.joi(req, res, next, {
    categoryId: $joi.string(),
    category: $joi.string().min(3).max(30).trim(),
    image: $joi.string().allow(null, ''),
    oldSubCategories: $joi.array().items(
      $joi.object({
        _id: $joi.string(),
        subCategory: $joi.string().min(3).max(30).trim(),
        image: $joi.string().allow(null, '')
      })
    ),
    subCategories: $joi
      .array()
      .items(
        $joi.object({
          subCategory: $joi.string().min(3).max(30).trim(),
          image: $joi.string().allow(null, '')
        })
      )
      .allow(null, '')
  })

module.exports.fetch = (req, res, next) =>
  _validate.joi(req, res, next, {
    categoryId: $joi.string()
  })

module.exports.delete = (req, res, next) =>
  _validate.joi(req, res, next, {
    categoryId: $joi.string()
  })

module.exports.fetchAnalytics = (req, res, next) =>
  _validate.joi(req, res, next, {
    categoryId: $joi.string(),
    state: $joi.string().allow(null, ''),
    city: $joi.string().allow(null, '')
  })
