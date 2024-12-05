const { _r } = require('express-tools');
const { User } = require('../../../models');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Define plan details
const PLAN_DETAILS = {
  'Plan A': { price: 599, duration: 1 },  // Duration in years
  'Plan B': { price: 2499, duration: 5 },
  'Plan C': { price: 4999, duration: 10 }
};

/**
 * Update payment plan for a user
 * @argument {ObjectId} id
 * @argument {String} plan
 */
module.exports.updatePaymentPlan = async (req, res) => {
  try {
    const { args } = req.bind;

    // Validate plan existence
    const selectedPlan = PLAN_DETAILS[args.plan];
    if (!selectedPlan) return _r.error({ req, res, code: 400, message: 'Invalid plan selected' });

    // Find user by ID
    const user = await User.findById(ObjectId(args.id));
    if (!user) return _r.error({ req, res, code: 404, message: 'User not found' });

    // Calculate plan expiration date
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + selectedPlan.duration);

    // Update user's plan
    user.plan = args.plan;
    user.planExpiresAt = expirationDate;
    user.updatedAt = new Date();

    await user.save();

    _r.success({
      req,
      res,
      code: 200,
      message: `Payment plan updated to ${args.plan} successfully.`,
      payload: { user }
    });
  } catch (error) {
    _r.error({ req, res, error });
  }
};
