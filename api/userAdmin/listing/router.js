const { $express } = require('express-tools')
const { middlewares } = require('../../../helpers')

const $router = $express.Router()
module.exports = $router

const validator = require('./validator')
const controller = require('./controller')

$router.use(middlewares.fetchUser)
$router.post('/create', validator.create, controller.create)
$router.put('/update', validator.update, controller.update)
$router.get('/fetch', validator.fetch, controller.fetch)
$router.get('/fetchAll', validator.fetchAll, controller.fetchAll)
$router.delete('/delete', validator.delete, controller.delete)
$router.put('/toggleListingStatus', validator.toggleListingStatus, controller.toggleListingStatus)
$router.get('/fetchListingsCount', validator.fetchListingsCount, controller.fetchListingsCount)
$router.get('/fetchListingPrefilledData', controller.fetchListingPrefilledData)
