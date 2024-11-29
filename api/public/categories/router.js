const { $express } = require('express-tools')

const $router = $express.Router()
module.exports = $router

// const validator = require('./validator')
const controller = require('./controller')

$router.get('/fetchAllCategories', controller.fetchAllCategories)
$router.get('/fetchAllSubCategories', controller.fetchAllSubCategories)
