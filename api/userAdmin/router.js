const { $express } = require('express-tools')
const router = $express.Router()

router.use('/business', require('./business/router'))
router.use('/businessLeads', require('./businessLeads/router'))
router.use('/categories', require('./categories/router'))
router.use('/leads', require('./leads/router'))
router.use('/listing', require('./listing/router'))
router.use('/notification', require('./notification/router'))
router.use('/user', require('./user/router'))

module.exports = router
