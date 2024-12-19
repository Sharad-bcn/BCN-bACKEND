const { $express } = require('express-tools')
const { middlewares } = require('../../../helpers')

const $router = $express.Router()
module.exports = $router

const validator = require('./validator')
const controller = require('./controller')

$router.use(middlewares.fetchAdmin)
$router.post('/create', validator.create, controller.create)
$router.put('/blockUser', validator.blockUser, controller.blockUser)
$router.get('/fetchAll', validator.fetchAll, controller.fetchAll)
$router.put('/updateApprovalStatus', validator.updateApprovalStatus, controller.updateApprovalStatus)
$router.get('/fetchNewlyCreated', validator.fetchNewlyCreated, controller.fetchNewlyCreated)
$router.get('/fetchSingle/:id', validator.fetchSingle, controller.fetchSingle)
$router.get('/fetchUserBusinesses/:userId', validator.fetchUserBusinesses, controller.fetchUserBusinesses)