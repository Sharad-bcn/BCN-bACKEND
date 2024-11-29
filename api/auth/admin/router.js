const { $express } = require('express-tools')
const { middlewares } = require('../../../helpers')

const $router = $express.Router()
module.exports = $router

const validator = require('./validator')
const controller = require('./controller')

$router.post('/logIn', validator.logIn, controller.logIn)

$router.use(middlewares.fetchAdmin)
$router.get('/getAdmin', controller.getAdmin)
$router.get('/getUserAdmin', validator.getUserAdmin, controller.getUserAdmin)
$router.delete('/logOut', controller.logOut)
