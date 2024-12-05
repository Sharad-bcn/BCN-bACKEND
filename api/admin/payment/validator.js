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
