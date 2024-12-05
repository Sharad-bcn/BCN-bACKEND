const { $express } = require('express-tools')
const router = $express.Router()

router.use('/admin', require('./admin/router'))
router.use('/user', require('./user/router'))

module.exports = router
