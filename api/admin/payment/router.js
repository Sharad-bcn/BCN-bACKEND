const { $express } = require('express-tools');
const { middlewares } = require('../../../helpers');

const $router = $express.Router();
module.exports = $router;

const validator = require('./validator');
const controller = require('./controller');


// Middleware to fetch admin if required
$router.use(middlewares.fetchAdmin);
console.log(middlewares.fetchAdmin);
// Update Payment Plan Endpoint
$router.put('/updatePaymentPlan', validator.updatePaymentPlan, controller.updatePaymentPlan);
console.log(controller.updatePaymentPlan);
// Endpoint to create a payment link
$router.post('/createPayment', validator.createPayment, controller.createPayment);
console.log(controller.createPayment);
// Razorpay Webhook Endpoint
$router.post('/webhook', validator.webhook, controller.paymentWebhook);
console.log(controller.paymentWebhook);