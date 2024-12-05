const { $express } = require('express-tools')
const router = $express.Router()

router.use('/adminControls', require('./adminControls/router'))
router.use('/business', require('./business/router'))
router.use('/categories', require('./categories/router'))
router.use('/demographics', require('./demographics/router'))
router.use('/faq', require('./faq/router'))
router.use('/listing', require('./listing/router'))
router.use('/testimony', require('./testimony/router'))
router.use('/payment', require('./payment/router'))
router.use('/user', require('./user/router'))

module.exports = router
