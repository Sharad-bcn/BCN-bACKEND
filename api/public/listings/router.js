const { $express } = require('express-tools')

const $router = $express.Router()
module.exports = $router

const validator = require('./validator')
const controller = require('./controller')

$router.get('/fetchAll', validator.fetchAll, controller.fetchAll)
$router.get('/searchListings', validator.searchListings, controller.searchListings)
$router.get('/fetch', validator.fetch, controller.fetch)
$router.get('/fetchBusinessListings', validator.fetchBusinessListings, controller.fetchBusinessListings)
$router.put('/updateViews', validator.updateViews, controller.updateViews)
