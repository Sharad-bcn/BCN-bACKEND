const { $express } = require('express-tools')
const { middlewares } = require('../../../helpers')

const $router = $express.Router()
module.exports = $router

const validator = require('./validator')
const controller = require('./controller')

$router.use(middlewares.fetchUser)
$router.get('/fetch', controller.fetch)
$router.put('/update', validator.update, controller.update)
$router.put('/changePin', validator.changePin, controller.changePin)
$router.get('/isNewUser', controller.isNewUser)
$router.post('/renewPlan', validator.renewPlan, controller.renewPlan)
$router.get('/fetchPaymentId', controller.fetchPaymentId)
