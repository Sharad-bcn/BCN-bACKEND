const { _validate, $joi } = require('express-tools')

module.exports.updateApprovalStatus = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string(),
    isApproved: $joi.boolean(),
    rejectionMessage: $joi.string().allow(null, '')
  })

module.exports.fetchNewlyCreated = (req, res, next) =>
  _validate.joi(req, res, next, {
    perPage: $joi.number(),
    pageNo: $joi.number().min(1)
  })
  module.exports.checkUserBusiness = (req, res, next) =>
    _validate.joi(req, res, next, {
      userId: $joi.string().required() // Validate userId as string (ObjectId)
    });
  