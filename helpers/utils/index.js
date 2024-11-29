const { _md5, $axios, _env } = require('express-tools')
const Razorpay = require('razorpay')
// const templates = require('./template')
const SMS_SERVER = _env('SMS_SERVER')
// const SMS_USER_ID = _env('SMS_USER_ID')
// const SMS_PASSWORD = _env('SMS_PASSWORD')
// const SMS_SENDER_ID = _env('SMS_SENDER_ID')
// const SMS_DLT_ENTITY_ID = _env('SMS_DLT_ENTITY_ID')
const SMS_AUTH_KEY = _env('SMS_AUTH_KEY')
const SMS_TEMPLATE_ID_MOBILE_VERIFICATION = _env('SMS_TEMPLATE_ID_MOBILE_VERIFICATION')
const SMS_TEMPLATE_ID_RESETTING_PASSWORD = _env('SMS_TEMPLATE_ID_RESETTING_PASSWORD')
const RAZOR_PAY_API_KEY = _env('RAZOR_PAY_API_KEY')
const RAZOR_PAY_API_SECRET = _env('RAZOR_PAY_API_SECRET')
let SMS_TEST = _env('SMS_TEST')
SMS_TEST = SMS_TEST === 'true'

const generateUniqueKey = () => _md5(Math.round(Math.random() * 1e10).toString() + Date.now().toString())

module.exports.generateUniqueKey = generateUniqueKey

const sendOtp = async ({ type = 'OTP', phoneNo, otp }) => {
  let data = {
    MediaFile: '',
    ContactNo: '91' + phoneNo,
    MediaFileName: '',
    ContactName: '',
    Attribute1: otp
  }

  const formData = new FormData()
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value)
  }

  return $axios({
    method: 'post',
    baseURL: SMS_SERVER,
    url: `/Campaign/SendSingleTemplateMessage?templateId=${
      type === 'OTP' ? SMS_TEMPLATE_ID_MOBILE_VERIFICATION : SMS_TEMPLATE_ID_RESETTING_PASSWORD
    }`,
    headers: {
      Accept: '*/*',
      'X-Api-Key': SMS_AUTH_KEY,
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })

  // let data = {
  //   userid: SMS_USER_ID,
  //   password: SMS_PASSWORD,
  //   mobile: phoneNo,
  //   senderid: SMS_SENDER_ID,
  //   dltEntityId: SMS_DLT_ENTITY_ID,
  //   msg: type === 'OTP' ? templates.otp(otp) : templates.resettingPin(otp),
  //   sendMethod: 'quick',
  //   msgType: 'text',
  //   dltTemplateId: type === 'OTP' ? SMS_TEMPLATE_ID_MOBILE_VERIFICATION : SMS_TEMPLATE_ID_RESETTING_PASSWORD,
  //   output: 'json',
  //   duplicatecheck: true,
  //   test: SMS_TEST
  // }

  // const formData = new FormData()
  // for (const [key, value] of Object.entries(data)) {
  //   formData.append(key, value)
  // }

  // return $axios({
  //   method: 'post',
  //   baseURL: SMS_SERVER,
  //   url: '/send',
  //   headers: {
  //     'content-type': 'multipart/form-data',
  //     apikey: SMS_AUTH_KEY
  //   },
  //   data: formData
  // })
}
// $axios({
//   method: 'get',
//   baseURL: 'http://tdots.in',
//   url: '/api/pushsms',
//   headers: {
//     'content-type': 'application/json'
//   },
//   params: {
//     user: SMS_USER_ID,
//     authkey: SMS_AUTH_KEY,
//     sender: SMS_SENDER_ID,
//     mobile: phoneNo,
//     text: type === 'OTP' ? templates.otp(otp) : templates.resettingPin(otp),
//     // entityid:SMS_ENTITY_ID,
//     templateid: type === 'OTP' ? SMS_TEMPLATE_ID_MOBILE_VERIFICATION : SMS_TEMPLATE_ID_RESETTING_PASSWORD,
//     rpt: SMS_RPT
//   }
// })
module.exports.sendOtp = sendOtp

const getRazorPayInstance = () =>
  new Razorpay({
    key_id: RAZOR_PAY_API_KEY,
    key_secret: RAZOR_PAY_API_SECRET
  })

module.exports.getRazorPayInstance = getRazorPayInstance

const encrypt = data => Buffer.from(JSON.stringify(data), 'binary').toString('base64')

module.exports.encrypt = encrypt

const decrypt = data => JSON.parse(Buffer.from(data, 'base64').toString('binary'))

module.exports.decrypt = decrypt

const fetchPaymentStatus = async paymentId => {
  // try {
  // const paymentVerificationUrl = `https://api.razorpay.com/v1/payments/${paymentId}`
  // const response = await $axios({
  //   method: 'get',
  //   baseURL: 'https://api.razorpay.com/v1',
  //   url: `/payments/${paymentId}`,
  //   auth: {
  //     username: RAZOR_PAY_API_KEY,
  //     password: RAZOR_PAY_API_SECRET
  //   },
  //   headers: {
  //     'content-type': 'application/json'
  //   }
  // })
  // await $axios.get(paymentVerificationUrl, {
  //   auth: {
  //     username: RAZOR_PAY_API_KEY,
  //     password: RAZOR_PAY_API_SECRET
  //   }
  // })

  // return response.data.status
  const instance = getRazorPayInstance()
  let res = await instance.payments.fetch(paymentId)
  return res.status
  // } catch (error) {
  //   console.error('Error fetching payment status:', error)
  //   throw error
  // }
}
module.exports.fetchPaymentStatus = fetchPaymentStatus
