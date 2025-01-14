const { _validate, $joi } = require('express-tools');
module.exports.updatePaymentPlan = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi
      .string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/) // Validate ObjectId format
      .error(new Error('Invalid user ID')),
    plan: $joi
      .string()
      .valid('Plan A', 'Plan B', 'Plan C')
      .required()
      .error(new Error('Invalid or missing plan'))
  });

// Validator for creating payment link
module.exports.createPayment = (req, res, next) =>
  _validate.joi(req, res, next, {
    amount: $joi
      .number()
      .greater(0)
      .required()
      .error(new Error('Amount must be a positive number')),
    contactNumber: $joi
      .string()
      .pattern(/^[0-9]{10}$/)  // Validate 10-digit phone number
      .required()
      .error(new Error('Invalid contact number'))
  });

// Validator for Razorpay webhook
module.exports.webhook = (req, res, next) =>
  _validate.joi(req, res, next, {
    razorpay_payment_link_id: $joi
      .string()
      .required()
      .error(new Error('Missing Razorpay payment link ID')),
    razorpay_payment_id: $joi
      .string()
      .required()
      .error(new Error('Missing Razorpay payment ID')),
    razorpay_status: $joi
      .string()
      .valid('paid', 'pending', 'failed')  // Check for valid status
      .required()
      .error(new Error('Invalid payment status'))
  });