const { _r } = require('express-tools')
const { City, State } = require('../../../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

/**
 * @argument {String} city
 * @argument {Number} limit
 */
module.exports.fetchCityViaState = async (req, res) => {
  try {
    const { args } = req.bind

    const regexPattern = new RegExp(args.city, 'i')

    const matchingCities = await City.find({ city: regexPattern }).limit(args.limit)

    if (!matchingCities || matchingCities.length === 0) {
      return _r.error({ req, res, code: 400, message: 'No matching cities found' })
    }

    // Extract the fkStateId values from the matching cities
    const stateIds = matchingCities.map(city => city.fkStateId)

    // Find the corresponding states using the stateIds
    const states = await State.find({ _id: { $in: stateIds } })

    // Create a map to quickly access state information by state ID
    const stateMap = new Map()
    states.forEach(state => {
      stateMap.set(state._id.toString(), state)
    })

    // Build the final result array with city and state information
    const result = matchingCities.map(city => ({
      _id: city._id,
      city: city.city,
      state: stateMap.get(city.fkStateId.toString()).state,
      fkStateId: city.fkStateId,
      lat: city.lat,
      long: city.long
    }))

    _r.success({
      req,
      res,
      code: 200,
      payload: { total: matchingCities.length, cities: result }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {Number} lat
 * @argument {Number} long
 */
module.exports.locationPicker = async (req, res) => {
  try {
    const { args } = req.bind

    const maxDistance = 100000 //in meters

    let matchingCity = await City.findOne({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [args.long, args.lat] // Note the order: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      }
    })

    if (!matchingCity) return _r.error({ req, res, code: 400, message: 'No matching cities found' })

    // Find the corresponding states using the stateIds
    const state = await State.findById(matchingCity.fkStateId)

    if (state) {
      // getListing.address = business.address
      matchingCity = {
        ...matchingCity._doc,
        state: state ? state.state : null
      }
    } else {
      matchingCity.state = null // Set address to null if business is not found
    }

    _r.success({
      req,
      res,
      code: 200,
      payload: { city: matchingCity }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {String} state
 * @argument {Number} limit
 */
module.exports.fetchAllStates = async (req, res) => {
  try {
    const { args } = req.bind

    const regexPattern = new RegExp(args.state, 'i')

    const matchingStates = await State.find({ state: regexPattern }).limit(args.limit)

    if (!matchingStates || matchingStates.length === 0) {
      return _r.error({ req, res, code: 400, message: 'No matching states found' })
    }

    _r.success({
      req,
      res,
      code: 200,
      payload: { total: matchingStates.length, states: matchingStates }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} fkStateId
 * @argument {String} city
 * @argument {Number} limit
 */

module.exports.fetchAllCitiesViaState = async (req, res) => {
  try {
    const { args } = req.bind

    const regexPattern = new RegExp(args.city, 'i')

    const matchingCities = await City.find({ fkStateId: args.fkStateId, city: regexPattern }).limit(args.limit)

    if (!matchingCities || matchingCities.length === 0)
      return _r.error({ req, res, code: 400, message: 'No matching cities found' })

    _r.success({
      req,
      res,
      code: 200,
      payload: { total: matchingCities.length, cities: matchingCities }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {String} city
 */
module.exports.fetchCoordinatesViaCity = async (req, res) => {
  try {
    const { args } = req.bind

    const regexPattern = new RegExp(args.city, 'i')

    let matchingCityCoordinates = await City.findOne({
      city: regexPattern
    })

    if (!matchingCityCoordinates) return _r.error({ req, res, code: 400, message: 'City not found' })

    _r.success({
      req,
      res,
      code: 200,
      payload: {
        lat: matchingCityCoordinates.location.coordinates[1],
        lng: matchingCityCoordinates.location.coordinates[0]
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
