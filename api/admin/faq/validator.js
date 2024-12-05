const { _validate, $joi } = require('express-tools')

module.exports.update = (req, res, next) =>
  _validate.joi(req, res, next, {
    faqs: $joi
      .array()
      .items(
        $joi.object({
          question: $joi.string().min(3).trim(),
          answer: $joi.string().min(3).trim()
        })
      )
      .allow(null, '')
  })
