const { _r, _env } = require('express-tools')
const { User, ActiveUsers, UserOTPs } = require('../../../models')
const jwt = require('jsonwebtoken')
const { utils } = require('../../../helpers')
const JWT_SECRET = _env('JWT_SECRET')
const OTP_DEFAULT = _env('OTP_DEFAULT')
const OTP_LENGTH = _env('OTP_LENGTH')
const OTP_EXPIRY = _env('OTP_EXPIRY')
let SMS_TEST = _env('SMS_TEST')
SMS_TEST = SMS_TEST === 'true'

/**
 * @argument {Number} phoneNo
 * @argument {Number} pin
 */

module.exports.logIn = async (req, res) => {
  try {
    const { args } = req.bind

    const authorizationHeader = req.headers.authorization
    if (authorizationHeader) _r.error({ req, res, code: 400, message: 'User already logged in' })

    let user = await User.findOne({ phoneNo: args.phoneNo, pin: args.pin })

    if (!user) return _r.error({ req, res, code: 400, message: 'User not found' })

    let referredUsersCount = await User.count({ fkRefId: user.userRefId })

    const data = {
      user: { id: user.id }
    }

    const authorization = jwt.sign(data, JWT_SECRET, {
      expiresIn: '30d'
    })

    const signInUser = await ActiveUsers.create({
      token: authorization,
      fkUserId: user.id
    })

    _r.success({
      req,
      res,
      code: 201,
      message: 'Welcome ' + user.firstName + ' to BCN',
      payload: {
        authorization,
        userData: {
          name: user.firstName + ' ' + user.lastName,
          logo: user.logo,
          userRefId: user.userRefId,
          referredUsersCount,
          plan: user.plan,
          planExpiresAt: user.planExpiresAt
        }
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.getUser = async (req, res) => {
  try {
    const currentUserPlan = await User.findById(req.bind.user.id, 'plan')
    if (currentUserPlan.plan === 'Plan 0') _r.success({ req, res, code: 401, message: 'User Plan Expired' })
    else _r.success({ req, res, code: 201, message: 'User already logged in' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.logOut = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization

    let fetchActiveUser = await ActiveUsers.findOne({ token: authorizationHeader })

    if (!fetchActiveUser) return _r.error({ req, res, code: 400, message: 'Active user not found' })

    const currentActiveUser = await User.findById(req.bind.user.id, 'firstName')

    let signOutActiveUser = await ActiveUsers.deleteOne({ _id: fetchActiveUser.id })

    _r.success({ req, res, code: 201, message: currentActiveUser.firstName + ' logged out successfully' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {Number} phoneNo
 */
module.exports.requestOTP = async (req, res) => {
  try {
    const { args } = req.bind
    const otp = !SMS_TEST
      ? parseInt(Math.random() * 10 ** (OTP_LENGTH - 1)) + 10 ** (OTP_LENGTH - 1) || OTP_DEFAULT
      : OTP_DEFAULT

    const isUserRegistered = await User.findOne({ phoneNo: args.phoneNo })

    if (isUserRegistered)
      return _r.error({ req, res, code: 400, message: 'User is already registered with this mobile' })

    const otpCountLast24Hours = await UserOTPs.count({
      phoneNo: args.phoneNo,
      otpType: 'RegisterUser',
      createdAt: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    })

    if (otpCountLast24Hours >= 3)
      return _r.error({ req, res, code: 400, message: 'OTP requests are limited, please try again later' })

    // Check if OTP already sent
    const otpAlreadyRequested = await UserOTPs.findOne({
      phoneNo: args.phoneNo,
      otpType: 'RegisterUser',
      createdAt: {
        $gt: new Date(Date.now() - OTP_EXPIRY)
      }
    })

    if (!otpAlreadyRequested) {
      if (!SMS_TEST) {
        let result = await utils.sendOtp({ phoneNo: args.phoneNo, otp })
        // if (result.data.status !== 'success') throw new Error(result.data.reason)
        if (!result.data.isSuccess) throw new Error(result.data.message)
      }
      await UserOTPs.create({ phoneNo: args.phoneNo, otp, otpType: 'RegisterUser' })
    } else {
      if (!SMS_TEST) {
        let result = await utils.sendOtp({ phoneNo: args.phoneNo, otp: otpAlreadyRequested.otp })
        if (!result.data.isSuccess) throw new Error(result.data.message)
        // if (result.data.status !== 'success') throw new Error(result.data.reason)
      }
    }
    _r.success({ req, res, code: 201, message: 'OTP sent' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument  {Number} phoneNo
 * @argument { Number } otp
 */
module.exports.verifyOTP = async (req, res) => {
  try {
    const { args } = req.bind

    const validOTP = await UserOTPs.findOne({
      phoneNo: args.phoneNo,
      otp: args.otp,
      otpType: 'RegisterUser'
    }).sort({ createdAt: -1 })

    if (!validOTP) return _r.success({ req, res, code: 400, success: false, message: 'No such OTP' })

    if (validOTP.createdAt < new Date(Date.now() - OTP_EXPIRY))
      return _r.success({ req, res, code: 400, message: 'OTP Expired!!' })

    const updateOTP = await UserOTPs.findByIdAndUpdate(
      validOTP._id,
      {
        $set: { isVerified: true }
      },
      { new: true }
    ).sort({ createdAt: -1 })

    if (!updateOTP) return _r.success({ req, res, code: 400, success: false, message: 'OTP verification failed' })

    _r.success({ req, res, code: 201, message: 'OTP is Verified' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {Number} phoneNo
 */
module.exports.resetPinOTP = async (req, res) => {
  try {
    const { args } = req.bind

    const otp = !SMS_TEST
      ? parseInt(Math.random() * 10 ** (OTP_LENGTH - 1)) + 10 ** (OTP_LENGTH - 1) || OTP_DEFAULT
      : OTP_DEFAULT

    const isUserRegistered = await User.findOne({ phoneNo: args.phoneNo })

    if (!isUserRegistered) return _r.error({ req, res, code: 400, message: 'User not found' })

    const otpCountLast24Hours = await UserOTPs.count({
      phoneNo: args.phoneNo,
      otpType: 'ResetPin',
      createdAt: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    })

    if (otpCountLast24Hours >= 3)
      return _r.error({ req, res, code: 400, message: 'OTP requests are limited, please try again later' })

    // Check if OTP already sent
    const otpAlreadyRequested = await UserOTPs.findOne({
      phoneNo: args.phoneNo,
      otpType: 'ResetPin',
      createdAt: {
        $gt: new Date(Date.now() - OTP_EXPIRY)
      }
    })

    if (!otpAlreadyRequested) {
      if (!SMS_TEST) {
        let result = await utils.sendOtp({ type: 'ResetPin', phoneNo: args.phoneNo, otp })
        // if (result.data.status !== 'success') throw new Error(result.data.reason)
        if (!result.data.isSuccess) throw new Error(result.data.message)
      }
      await UserOTPs.create({ phoneNo: args.phoneNo, otp, otpType: 'ResetPin' })
    } else {
      if (!SMS_TEST) {
        let result = await utils.sendOtp({ type: 'ResetPin', phoneNo: args.phoneNo, otp: otpAlreadyRequested })
        // if (result.data.status !== 'success') throw new Error(result.data.reason)
        if (!result.data.isSuccess) throw new Error(result.data.message)
      }
    }
    _r.success({ req, res, code: 201, message: 'OTP sent' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument  {Number} phoneNo
 * @argument { Number } otp
 */
module.exports.verifyResetPinOTP = async (req, res) => {
  try {
    const { args } = req.bind

    const validOTP = await UserOTPs.findOne({
      phoneNo: args.phoneNo,
      otpType: 'ResetPin',
      otp: args.otp
    }).sort({ createdAt: -1 })

    if (!validOTP) return _r.success({ req, res, code: 400, success: false, message: 'No such OTP' })

    if (validOTP.createdAt < new Date(Date.now() - OTP_EXPIRY))
      return _r.success({ req, res, code: 400, message: 'OTP Expired!!' })

    const updateOTP = await UserOTPs.findByIdAndUpdate(
      validOTP._id,
      {
        $set: { isVerified: true }
      },
      { new: true }
    ).sort({ createdAt: -1 })

    if (!updateOTP) return _r.success({ req, res, code: 400, success: false, message: 'OTP verification failed' })

    _r.success({ req, res, code: 201, message: 'Valid OTP' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
