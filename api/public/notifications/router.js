const { $express } = require('express-tools')

const $router = $express.Router()
module.exports = $router

const validator = require('./validator')
const controller = require('./controller')

$router.post('/create', validator.create, controller.create)
