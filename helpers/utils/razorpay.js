const axios = require('axios');
const crypto = require('crypto');

const RAZORPAY_KEY_ID = process.env.RAZOR_PAY_API_KEY;
const RAZORPAY_KEY_SECRET = process.env.RAZOR_PAY_API_SECRET;
const RAZORPAY_API_URL = 'https://api.razorpay.com/v1/payment_links';

/**
 * Create a Razorpay payment link
 */
const createPaymentLink = async (amount, contact, notes) => {
  try {
    const response = await axios.post(
      RAZORPAY_API_URL,
      {
        amount: amount * 100, // Razorpay requires the amount in paise (1 INR = 100 paise)
        currency: 'INR',
        description: `Payment for ${notes.plan}`,
        customer: { contact },
        notes,
        callback_url: 'https://yourdomain.com/api/admin/payment/webhook',  // Callback URL for webhook verification
        reminder_enable: true,
      },
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating Razorpay payment link:', error.message);
    throw new Error('Error creating payment link');
  }
};

/**
 * Verify Razorpay webhook signature
 */
const verifySignature = (data) => {
  const razorpaySignature = data.headers['x-razorpay-signature'];
  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(JSON.stringify(data.body))
    .digest('hex');

  return generatedSignature === razorpaySignature;
};

module.exports = { createPaymentLink, verifySignature };
