const { $express } = require('express-tools')
const { middlewares } = require('../../../helpers')

const $router = $express.Router()
module.exports = $router

const validator = require('./validator')
const controller = require('./controller')

$router.use(middlewares.fetchAdmin)
$router.post('/create', validator.create, controller.create)
$router.get('/fetch', controller.fetch)
$router.put('/update', validator.update, controller.update)
$router.put('/changePin', validator.changePin, controller.changePin)
$router.get('/fetchAll', validator.fetchAll, controller.fetchAll)
$router.delete('/delete', validator.delete, controller.delete)
