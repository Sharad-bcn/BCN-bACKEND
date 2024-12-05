const { $express } = require('express-tools')

const $router = $express.Router()
module.exports = $router

const validator = require('./validator')
const controller = require('./controller')

$router.get('/fetchCityViaState', validator.fetchCityViaState, controller.fetchCityViaState)
$router.get('/locationPicker', validator.locationPicker, controller.locationPicker)
$router.get('/fetchAllStates', validator.fetchAllStates, controller.fetchAllStates)
$router.get('/fetchAllCitiesViaState', validator.fetchAllCitiesViaState, controller.fetchAllCitiesViaState)
$router.get('/fetchCoordinatesViaCity', validator.fetchCoordinatesViaCity, controller.fetchCoordinatesViaCity)
