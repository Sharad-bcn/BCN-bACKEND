const { $express } = require('express-tools');
const { middlewares } = require('../../../helpers');

const $router = $express.Router();
module.exports = $router;

const validator = require('./validator');
const controller = require('./controller');

// Middleware to fetch admin if required
$router.use(middlewares.fetchAdmin);

// Update Payment Plan Endpoint
$router.put('/updatePaymentPlan', validator.updatePaymentPlan, controller.updatePaymentPlan);
