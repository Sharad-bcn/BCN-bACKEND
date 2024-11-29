const { $express } = require('express-tools')
const { middlewares } = require('../helpers')
const router = $express.Router()

router.use(middlewares.checkOrigin)
router.use('/admin', require('./admin/router'))
router.use('/auth', require('./auth/router'))
router.use('/public', require('./public/router'))
router.use('/userAdmin', require('./userAdmin/router'))

module.exports = router
