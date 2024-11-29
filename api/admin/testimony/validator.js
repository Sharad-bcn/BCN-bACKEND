const { _validate, $joi } = require('express-tools')

module.exports.update = (req, res, next) =>
  _validate.joi(req, res, next, {
    oldTestimonies: $joi
      .array()
      .items(
        $joi.object({
          _id: $joi.string(),
          testimony: $joi.string(),
          name: $joi.string().min(3).max(30).trim(),
          designation: $joi.string().min(3).max(30).trim(),
          image: $joi.string().allow(null, '')
        })
      )
      .allow(null, ''),
    testimonies: $joi
      .array()
      .items(
        $joi.object({
          testimony: $joi.string(),
          name: $joi.string().min(3).max(30).trim(),
          designation: $joi.string().min(3).max(30).trim(),
          image: $joi.string().allow(null, '')
        })
      )
      .allow(null, '')
  })
