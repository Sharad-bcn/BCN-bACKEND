const axios = require('axios');

const SMS_API_URL = process.env.SMS_API_URL;
const ENTITY_ID = process.env.ENTITY_ID;
const TEMPLATE_ID = process.env.TEMPLATE_ID;
const HEADER = process.env.HEADER;

// Function to send SMS
const sendSMS = async (contactNumber, message) => {
  try {
    const payload = {
      entity_id: ENTITY_ID,
      template_id: TEMPLATE_ID,
      mobile_number: contactNumber,
      message: message,
      header: HEADER,
    };

    const response = await axios.post(SMS_API_URL, payload);
    console.log('SMS sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    throw new Error('Error sending SMS');
  }
};

module.exports = { sendSMS };
