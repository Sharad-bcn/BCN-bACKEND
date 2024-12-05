const { $express } = require('express-tools')
const { middlewares } = require('../../../helpers')

const $router = $express.Router()
module.exports = $router

const validator = require('./validator')
const controller = require('./controller')

$router.post('/logIn', validator.logIn, controller.logIn)
$router.get('/requestOTP', validator.requestOTP, controller.requestOTP)
$router.post('/verifyOTP', validator.verifyOTP, controller.verifyOTP)
$router.get('/resetPinOTP', validator.resetPinOTP, controller.resetPinOTP)
$router.post('/verifyResetPinOTP', validator.verifyResetPinOTP, controller.verifyResetPinOTP)
$router.use(middlewares.fetchUser)
$router.get('/getUser', controller.getUser)
$router.delete('/logOut', controller.logOut)
