const { $express } = require('express-tools')
const { middlewares } = require('../../../helpers')

const $router = $express.Router()
module.exports = $router

const validator = require('./validator')
const controller = require('./controller')

$router.use(middlewares.fetchAdmin)
$router.put('/update', validator.update, controller.update)
$router.get('/fetch', controller.fetch)
