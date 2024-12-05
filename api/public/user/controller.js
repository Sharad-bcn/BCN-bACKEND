const { _r, _env } = require('express-tools')
const { User, UserOTPs, Payment } = require('../../../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const jwt = require('jsonwebtoken')
const JWT_SECRET = _env('JWT_SECRET')
const { utils } = require('../../../helpers')
const crypto = require('crypto')
const RAZOR_PAY_API_KEY = _env('RAZOR_PAY_API_KEY')
const RAZOR_PAY_API_SECRET = _env('RAZOR_PAY_API_SECRET')

/**
 * @argument {String} razorPayOrderId
 * @argument {String} razorPayPaymentId
 * @argument {String} razorPaySignature
 * @argument {String} plan
 * @argument {String} firstName
 * @argument {String} lastName
 * @argument {String} gender
 * @argument {ObjectId} userRefId
 * @argument {String} email
 * @argument {String} address
 * @argument {Number} phoneNo
 * @argument {String} state
 * @argument {String} city
 * @argument {Number} pinCode
 * @argument {ObjectId} fkRefId
 * @argument {String} pin
 * @argument {String} logo
 */

module.exports.create = async (req, res) => {
  try {
    let { args } = req.bind
    let getPayment = ''

    const alreadyExists = await User.findOne({
      phoneNo: args.phoneNo
    })

    if (alreadyExists) return _r.error({ req, res, code: 400, message: 'User already exists' })

    if (args.email) {
      const user = await User.findOne({
        email: args.email
      })
      if (user) return _r.error({ req, res, code: 400, message: 'User with this email already exists' })
    }
    // args.userRefId = new ObjectId().toString()

    const validOTP = await UserOTPs.findOne({
      phoneNo: args.phoneNo,
      otpType: 'RegisterUser',
      isVerified: true
    }).sort({ createdAt: -1 })

    if (!validOTP) return _r.success({ req, res, code: 400, success: false, message: 'User not verified!!' })

    if (args.fkRefId) {
      const fkUserRefId = await User.findOne({ userRefId: args.fkRefId })

      if (!fkUserRefId) return _r.error({ req, res, code: 400, message: 'Reference id not found' })
      else args.fkRefId = fkUserRefId.userRefId
    }

    if (args.razorPayOrderId && args.razorPayPaymentId && args.razorPaySignature) {
      getPayment = await Payment.findOne({
        razorPayOrderId: args.razorPayOrderId,
        razorPayPaymentId: args.razorPayPaymentId,
        razorPaySignature: args.razorPaySignature
      })
      if (!getPayment) return _r.success({ req, res, code: 400, success: false, message: 'Payment not verified!!' })
    } else {
      args.plan = 'Plan 0'
    }

    const duration = args.plan === 'Plan A' ? 1 : args.plan === 'Plan B' ? 5 : args.plan === 'Plan C' ? 10 : 0
    let expirationDate = new Date(Date.now())
    expirationDate.setFullYear(expirationDate.getFullYear() + duration)
    args.planExpiresAt = expirationDate

    let newUser = await User.create(args)

    if (getPayment) {
      const updatePayment = await Payment.updateOne(
        { _id: getPayment.id },
        {
          $set: {
            fkUserId: newUser.id
          }
        }
      )
    }

    const data = {
      user: {
        id: newUser.id
      }
    }

    const authorization = jwt.sign(data, JWT_SECRET, {
      expiresIn: '30d'
    })

    _r.success({
      req,
      res,
      code: 201,
      message: newUser.firstName + ' registered successfully',
      payload: {
        authorization,
        userData: {
          name: newUser.firstName + ' ' + newUser.lastName,
          logo: newUser.logo,
          userRefId: newUser.userRefId,
          plan: newUser.plan,
          planExpiresAt: newUser.planExpiresAt
        }
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} id
 */

module.exports.fetch = async (req, res) => {
  try {
    let { args } = req.bind

    const user = await User.findById(args.id, '-pin -updatedAt -__v -planExpiresAt -plan -isNewUser', {
      lean: true
    })

    if (!user) return _r.error({ req, res, code: 400, message: 'User not found' })

    if (user.isBlocked) return _r.error({ req, res, code: 400, message: 'User is Blocked' })

    if (!user.isApproved) return _r.error({ req, res, code: 400, message: 'User profile is under review' })

    _r.success({
      req,
      res,
      code: 201,
      payload: {
        user
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {String} email
 * @argument {ObjectId} fkRefId
 * @argument {Number} phoneNo
 */

module.exports.part2Validation = async (req, res) => {
  try {
    let { args } = req.bind
    let refId = {}

    if (args.fkRefId) {
      const user = await User.findOne({
        userRefId: args.fkRefId
      })
      if (!user) return _r.error({ req, res, code: 400, message: 'Reference Id not found' })
      else {
        refId.refId = user.userRefId
        refId.referredby = user.firstName + ' ' + user.lastName
      }
    }

    if (args.email) {
      const user = await User.findOne(
        {
          email: args.email
        },
        { lean: true }
      )
      if (user) return _r.error({ req, res, code: 400, message: 'User with this email already exists' })
    }

    const user = await User.findOne(
      {
        phoneNo: args.phoneNo
      },
      { lean: true }
    )
    if (user) return _r.error({ req, res, code: 400, message: 'User with this phoneNo already exists' })

    _r.success({
      req,
      res,
      code: 201,
      payload: args.fkRefId
        ? {
            refId
          }
        : {},
      message: 'Part 2 is validated'
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {String} pin
 * @argument {Number} phoneNo
 */

module.exports.forgotPin = async (req, res) => {
  try {
    let { args } = req.bind

    const validOTP = await UserOTPs.findOne({
      phoneNo: args.phoneNo,
      otpType: 'ResetPin',
      isVerified: true
    }).sort({ createdAt: -1 })

    if (!validOTP) return _r.success({ req, res, code: 400, success: false, message: 'UnAuthorized action' })

    if (validOTP && validOTP.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000))
      return _r.success({ req, res, code: 400, success: false, message: 'UnAuthorized action' })

    let fetchUser = await User.findOne({ phoneNo: args.phoneNo })

    if (!fetchUser) return _r.error({ req, res, code: 400, message: 'User not found' })

    let updateUserPin = await User.findByIdAndUpdate(fetchUser.id, { $set: { pin: args.pin } }, { new: true })

    _r.success({
      req,
      res,
      code: 201,
      message: updateUserPin.firstName + ' ' + updateUserPin.lastName + "'s Pin updated successfully",
      payload: {}
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.paymentPreRequisites = async (req, res) => {
  try {
    const data = { key: utils.encrypt(RAZOR_PAY_API_KEY) }
    _r.success({
      req,
      res,
      code: 201,
      payload: { data }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {Number} amount
 */

module.exports.paymentCheckOut = async (req, res) => {
  try {
    let { args } = req.bind
    args.currency = 'INR'
    args.amount = args.amount * 100

    const instance = utils.getRazorPayInstance()
    const order = await instance.orders.create({ ...args })

    _r.success({
      req,
      res,
      code: 201,
      payload: { order }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {String} razorPayOrderId
 * @argument {String} razorPayPaymentId
 * @argument {String} razorPaySignature
 */

module.exports.paymentVerification = async (req, res) => {
  try {
    let { args } = req.bind

    const body = args.razorPayOrderId + '|' + args.razorPayPaymentId

    const expectedSignature = crypto.createHmac('sha256', RAZOR_PAY_API_SECRET).update(body.toString()).digest('hex')

    const isAuthentic = expectedSignature === args.razorPaySignature

    if (!isAuthentic) throw new Error('Payment not verified!!')

    // const instance = utils.getRazorPayInstance()
    // const paymentStatus = await utils.fetchPaymentStatus(args.razorPayPaymentId)

    await Payment.create({ ...args })
    _r.success({
      req,
      res,
      code: 201,
      message: 'Payment verified!!'
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {String} id
 */

module.exports.validPayment = async (req, res) => {
  try {
    let { args } = req.bind
    const isValid = await Payment.findOne({ razorPayPaymentId: args.id })

    if (!isValid) return _r.success({ req, res, code: 400, success: false, message: 'Payment invalid!!' })

    const getUser = await User.findOne({ _id: isValid.fkUserId })

    if (!getUser) return _r.success({ req, res, code: 400, success: false, message: 'Payment invalid!!' })

    _r.success({
      req,
      res,
      code: 201,
      message: 'Payment valid!!',
      payload: {
        user: {
          firstName: getUser.firstName,
          lastName: getUser.lastName,
          phoneNo: getUser.phoneNo,
          plan: getUser.plan,
          email: getUser.email,
          createdAt: isValid.createdAt
        }
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
