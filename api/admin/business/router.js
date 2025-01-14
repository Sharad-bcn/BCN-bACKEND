const { $express } = require('express-tools')
const { middlewares } = require('../../../helpers')

const $router = $express.Router()
module.exports = $router

const validator = require('./validator')
const controller = require('./controller')

$router.use(middlewares.fetchAdmin)
$router.put('/updateApprovalStatus', validator.updateApprovalStatus, controller.updateApprovalStatus)
$router.get('/fetchNewlyCreated', validator.fetchNewlyCreated, controller.fetchNewlyCreated),
$router.get('/checkUserBusiness', validator.checkUserBusiness, controller.checkUserBusiness);
