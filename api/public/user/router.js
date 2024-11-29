const { $express, EMPTY_REQUEST } = require('express-tools')

const $router = $express.Router()
module.exports = $router

const validator = require('./validator')
const controller = require('./controller')

$router.post('/create', validator.create, controller.create)
$router.get('/fetch', validator.fetch, controller.fetch)
$router.get('/part2Validation', validator.part2Validation, controller.part2Validation)
$router.post('/forgotPin', validator.forgotPin, controller.forgotPin)
$router.get('/paymentPreRequisites', EMPTY_REQUEST, controller.paymentPreRequisites)
$router.post('/paymentCheckOut', validator.paymentCheckOut, controller.paymentCheckOut)
$router.post('/paymentVerification', validator.paymentVerification, controller.paymentVerification)
$router.get('/validPayment', validator.validPayment, controller.validPayment)
