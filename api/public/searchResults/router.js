const { $express } = require('express-tools')

const $router = $express.Router()
module.exports = $router

const validator = require('./validator')
const controller = require('./controller')

$router.get('/fetchBaseFields', validator.fetchBaseFields, controller.fetchBaseFields)
$router.get('/searchFields', validator.searchFields, controller.searchFields)
