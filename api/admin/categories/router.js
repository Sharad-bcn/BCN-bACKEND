const { $express } = require('express-tools')
const { middlewares } = require('../../../helpers')

const $router = $express.Router()
module.exports = $router

const validator = require('./validator')
const controller = require('./controller')

$router.use(middlewares.fetchAdmin)
$router.post('/create', validator.create, controller.create)
$router.put('/update', validator.update, controller.update)
$router.get('/fetch', validator.fetch, controller.fetch)
$router.delete('/delete', validator.delete, controller.delete)
$router.get('/fetchAnalytics', validator.fetchAnalytics, controller.fetchAnalytics)
