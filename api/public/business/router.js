const { $express } = require('express-tools')

const $router = $express.Router()
module.exports = $router

const validator = require('./validator')
const controller = require('./controller')

$router.get('/fetch', validator.fetch, controller.fetch)
$router.get('/fetchBusinessLocations', controller.fetchBusinessLocations)
$router.get('/fetchAll', validator.fetchAll, controller.fetchAll)
$router.get(
  '/fetchAllBusinessWithNoListings',
  validator.fetchAllBusinessWithNoListings,
  controller.fetchAllBusinessWithNoListings
)
$router.get('/searchBusiness', validator.searchBusiness, controller.searchBusiness)
$router.get('/fetchProfileBusinesses', validator.fetchProfileBusinesses, controller.fetchProfileBusinesses)
$router.put('/updateViews', validator.updateViews, controller.updateViews)
