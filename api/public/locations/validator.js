const { _validate, $joi } = require('express-tools')

module.exports.fetchCityViaState = (req, res, next) =>
  _validate.joi(req, res, next, {
    city: $joi.string().allow(null, ''),
    limit: $joi.number()
  })

module.exports.locationPicker = (req, res, next) =>
  _validate.joi(req, res, next, {
    lat: $joi.number(),
    long: $joi.number()
  })

module.exports.fetchAllStates = (req, res, next) =>
  _validate.joi(req, res, next, {
    state: $joi.string().allow(null, ''),
    limit: $joi.number()
  })

module.exports.fetchAllCitiesViaState = (req, res, next) =>
  _validate.joi(req, res, next, {
    fkStateId: $joi.string(),
    city: $joi.string().allow(null, ''),
    limit: $joi.number()
  })

module.exports.fetchCoordinatesViaCity = (req, res, next) =>
  _validate.joi(req, res, next, {
    city: $joi.string()
  })
