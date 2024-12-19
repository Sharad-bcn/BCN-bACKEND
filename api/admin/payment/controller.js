// const { _r } = require('express-tools');
// const { User } = require('../../../models');
// const { createPaymentLink, sendSMS, verifySignature } = require('../../../helpers/utils');
// const mongoose = require('mongoose');
// const ObjectId = mongoose.Types.ObjectId;
// const Payment = require('../../../models/payment');
// // Define plan details
// const PLAN_DETAILS = {
//   'Plan A': { price: 599, duration: 1 },  // Duration in years
//   'Plan B': { price: 2499, duration: 5 },
//   'Plan C': { price: 4999, duration: 10 }
// };
// /**
//  * Update payment plan for a user
//  * @argument {ObjectId} id
//  * @argument {String} plan
//  */
// module.exports.updatePaymentPlan = async (req, res) => {
//   try {
//     const { args } = req.bind;
//     // Validate plan existence
//     const selectedPlan = PLAN_DETAILS[args.plan];
//     if (!selectedPlan) return _r.error({ req, res, code: 400, message: 'Invalid plan selected' });
//     // Find user by ID
//     const user = await User.findById(ObjectId(args.id));
//     if (!user) return _r.error({ req, res, code: 404, message: 'User not found' });
//     // Calculate plan expiration date
//     const expirationDate = new Date();
//     expirationDate.setFullYear(expirationDate.getFullYear() + selectedPlan.duration);
//     // Update user's plan
//     user.plan = args.plan;
//     user.planExpiresAt = expirationDate;
//     user.updatedAt = new Date();
//     await user.save();
//     _r.success({
//       req,
//       res,
//       code: 200,
//       message: `Payment plan updated to ${args.plan} successfully.`,
//       payload: { user }
//     });
//   } catch (error) {
//     _r.error({ req, res, error });
//   }
// };
// /**
//  * Generate a payment link for the selected plan
//  * @argument {ObjectId} id
//  * @argument {String} plan
//  */
// module.exports.createPayment = async (req, res) => {
//   try {
//     const { args } = req.bind;
//     const selectedPlan = PLAN_DETAILS[args.plan];
//     if (!selectedPlan) return _r.error({ req, res, code: 400, message: 'Invalid plan selected' });

//     const user = await User.findById(ObjectId(args.id));
//     if (!user) return _r.error({ req, res, code: 404, message: 'User not found' });

//     // Generate payment link
//     const paymentLinkData = await createPaymentLink(selectedPlan.price, user.phoneNo, {
//       user_id: user._id,
//       plan: args.plan,
//     });

//     // Send SMS with payment link
//     const message = `Hi ${user.firstName}, click here to pay for your ${args.plan}: ${paymentLinkData.short_url}`;
//     await sendSMS(user.phoneNo, message);

//     _r.success({
//       req,
//       res,
//       code: 200,
//       message: 'Payment link generated and SMS sent successfully.',
//       payload: { paymentLink: paymentLinkData.short_url },
//     });
//   } catch (error) {
//     _r.error({ req, res, error });
//   }
// };

// /**
//  * Handle Razorpay webhook for payment success
//  */
// module.exports.paymentWebhook = async (req, res) => {
//   try {
//     const paymentData = req.body;

//     // Verify webhook signature
//     const isVerified = require('../../../helpers/utils/razorpay').verifySignature(paymentData);
//     if (!isVerified) return res.status(400).send('Invalid webhook signature');

//     // Handle payment success event
//     if (paymentData.event === 'payment.captured') {
//       const { payment_id, amount, notes } = paymentData.payload.payment.entity;

//       // Save payment details
//       const payment = new Payment({
//         fkUserId: notes.user_id,
//         razorPayOrderId: notes.plink_id,
//         razorPayPaymentId: payment_id,
//         amount,
//       });
//       await payment.save();

//       // Update user plan
//       const user = await User.findById(notes.user_id);
//       if (user) {
//         const selectedPlan = PLAN_DETAILS[notes.plan];
//         const expirationDate = new Date();
//         expirationDate.setFullYear(expirationDate.getFullYear() + selectedPlan.duration);
//         user.plan = notes.plan;
//         user.planExpiresAt = expirationDate;
//         await user.save();
//       }

//       res.status(200).send('Webhook processed successfully');
//     } else {
//       res.status(400).send('Unhandled webhook event');
//     }
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//     res.status(500).send('Internal Server Error');
//   }
// };

const { _r } = require('express-tools');
const { User } = require('../../../models');
const { createPaymentLink, sendSMS, verifySignature } = require('../../../helpers/utils');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Payment = require('../../../models/payment');  // Ensure Payment model is imported

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
    if (!args.plan || !args.id) {
      return _r.error({ req, res, code: 400, message: 'Plan and User ID are required' });
    }

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

/**
 * Generate a payment link for the selected plan
 * @argument {ObjectId} id
 * @argument {String} plan
 */
module.exports.createPayment = async (req, res) => {
  try {
    const { args } = req.bind;
    if (!args.plan || !args.id) {
      return _r.error({ req, res, code: 400, message: 'Plan and User ID are required' });
    }

    const selectedPlan = PLAN_DETAILS[args.plan];
    if (!selectedPlan) return _r.error({ req, res, code: 400, message: 'Invalid plan selected' });

    const user = await User.findById(ObjectId(args.id));
    if (!user) return _r.error({ req, res, code: 404, message: 'User not found' });

    // Generate payment link
    const paymentLinkData = await createPaymentLink(selectedPlan.price, user.phoneNo, {
      user_id: user._id,
      plan: args.plan,
    });

    // Send SMS with payment link
    const message = `Hi ${user.firstName}, click here to pay for your ${args.plan}: ${paymentLinkData.short_url}`;
    await sendSMS(user.phoneNo, message);

    _r.success({
      req,
      res,
      code: 200,
      message: 'Payment link generated and SMS sent successfully.',
      payload: { paymentLink: paymentLinkData.short_url },
    });
  } catch (error) {
    _r.error({ req, res, error });
  }
};

/**
 * Handle Razorpay webhook for payment success
 */
module.exports.paymentWebhook = async (req, res) => {
  try {
    const paymentData = req.body;

    // Verify webhook signature
    const isVerified = verifySignature(paymentData);
    if (!isVerified) return res.status(400).send('Invalid webhook signature');

    // Handle payment success event
    if (paymentData.event === 'payment.captured') {
      const { payment_id, amount, notes } = paymentData.payload.payment.entity;

      // Save payment details
      const payment = new Payment({
        fkUserId: notes.user_id,
        razorPayOrderId: notes.plink_id,
        razorPayPaymentId: payment_id,
        amount,
      });
      await payment.save();

      // Update user plan
      const user = await User.findById(notes.user_id);
      if (user) {
        const selectedPlan = PLAN_DETAILS[notes.plan];
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + selectedPlan.duration);
        user.plan = notes.plan;
        user.planExpiresAt = expirationDate;
        await user.save();
      }

      res.status(200).send('Webhook processed successfully');
    } else {
      res.status(400).send('Unhandled webhook event');
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal Server Error');
  }
};
