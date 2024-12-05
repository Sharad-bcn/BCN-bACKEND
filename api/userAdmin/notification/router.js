const { $express, EMPTY_REQUEST } = require('express-tools')
const { middlewares } = require('../../../helpers')

const $router = $express.Router()
module.exports = $router

const validator = require('./validator')
const controller = require('./controller')

$router.use(middlewares.fetchUser)
$router.post('/create', validator.create, controller.create)
$router.get('/fetchAll', validator.fetchAll, controller.fetchAll)
$router.put('/markAsRead', validator.markAsRead, controller.markAsRead)
$router.put('/markAllAsRead', EMPTY_REQUEST, controller.markAllAsRead)
$router.delete('/delete', validator.delete, controller.delete)
$router.delete('/deleteAll', EMPTY_REQUEST, controller.deleteAll)
$router.get('/count', EMPTY_REQUEST, controller.count)
