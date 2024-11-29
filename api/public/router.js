const { $express } = require('express-tools')
const router = $express.Router()

router.use('/business', require('./business/router'))
router.use('/businessLeads', require('./businessLeads/router'))
router.use('/categories', require('./categories/router'))
router.use('/landingPage', require('./landingPage/router'))
router.use('/leads', require('./leads/router'))
router.use('/listings', require('./listings/router'))
router.use('/locations', require('./locations/router'))
router.use('/notifications', require('./notifications/router'))
router.use('/searchResults', require('./searchResults/router'))
router.use('/user', require('./user/router'))

module.exports = router
