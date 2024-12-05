const { _r } = require('express-tools')
const { User, Payment } = require('../../../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

/**
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
 * @argument {String} logo
 */

module.exports.update = async (req, res) => {
  try {
    let { args } = req.bind

    args.id = req.bind.user.id

    if (args.fkRefId) {
      const fkUserRefId = await User.findOne({ userRefId: { $regex: args.fkRefId + '$' } })

      if (!fkUserRefId) return _r.error({ req, res, code: 400, message: 'Reference id not found' })
      else {
        args.fkRefId = fkUserRefId.userRefId

        const getUser = await User.findById(args.id)

        if (getUser.userRefId === args.fkRefId)
          return _r.error({ req, res, code: 400, message: 'You can not reference yourself' })
      }
    }

    let updateUser = await User.findByIdAndUpdate(
      args.id,
      { $set: { ...args, isApproved: false, approvalStatus: 'Pending', rejectionMessage: '', isNewUser: false } },
      { new: true }
    )

    if (!updateUser) return _r.error({ req, res, code: 400, message: 'User not found' })

    _r.success({ req, res, code: 201, message: 'User updated successfully', payload: {} })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} id
 */
module.exports.fetch = async (req, res) => {
  try {
    const { id } = req.bind.user

    const getUser = await User.findById(id, '-pin')

    if (!getUser) return _r.error({ req, res, code: 400, message: 'User not found' })

    if (getUser.isBlocked) return _r.error({ req, res, code: 403, message: 'User Blocked' })

    const referredUsers = await User.count({ fkRefId: getUser.userRefId })

    const referredBy = await User.findOne({ userRefId: getUser.fkRefId })

    _r.success({
      req,
      res,
      code: 200,
      payload: {
        getUser,
        referredUsers,
        referredBy: referredBy ? referredBy.firstName + ' ' + referredBy.lastName : ''
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {String} oldPin
 * @argument {String} newPin
 */

module.exports.changePin = async (req, res) => {
  try {
    const { args } = req.bind

    args.id = req.bind.user.id

    let fetchUser = await User.findById(args.id)

    if (!fetchUser) return _r.error({ req, res, code: 400, message: 'User not found' })

    if (fetchUser.pin !== args.oldPin) return _r.error({ req, res, code: 400, message: 'Incorrect Old Pin' })

    let updateUserPin = await User.findByIdAndUpdate(args.id, { $set: { pin: args.newPin } }, { new: true })

    _r.success({ req, res, code: 201, message: 'User Pin updated successfully', payload: {} })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} id
 */
module.exports.isNewUser = async (req, res) => {
  try {
    const { id } = req.bind.user

    const getUser = await User.findById(id, '-pin')

    if (!getUser) return _r.error({ req, res, code: 400, message: 'User not found' })

    _r.success({
      req,
      res,
      code: 200,
      payload: {
        isNewUser: getUser.isNewUser
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {String} plan
 * @argument {String} razorPayOrderId
 * @argument {String} razorPayPaymentId
 * @argument {String} razorPaySignature
 */
module.exports.renewPlan = async (req, res) => {
  try {
    const { args } = req.bind
    const { id } = req.bind.user

    const getUser = await User.findById(id, '-pin')

    if (!getUser) return _r.error({ req, res, code: 400, message: 'User not found' })

    // if (getUser.plan !== 'Plan 0') return _r.error({ req, res, code: 400, message: 'No need to renew user plan' })

    const getPayment = await Payment.findOne({
      razorPayOrderId: args.razorPayOrderId,
      razorPayPaymentId: args.razorPayPaymentId,
      razorPaySignature: args.razorPaySignature
    })
    if (!getPayment) return _r.success({ req, res, code: 400, success: false, message: 'Payment not verified!!' })

    const updatePayment = await Payment.updateOne(
      { _id: getPayment.id },
      {
        $set: {
          fkUserId: getUser.id
        }
      }
    )
    const duration = args.plan === 'Plan A' ? 1 : args.plan === 'Plan B' ? 5 : args.plan === 'Plan C' ? 10 : 0
    const currentDate = new Date()
    const previousExpirationDate = new Date(getUser.planExpiresAt)
    let expirationDate = previousExpirationDate > currentDate ? previousExpirationDate : currentDate
    expirationDate.setFullYear(expirationDate.getFullYear() + duration)

    const updateUserPlan = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          plan: args.plan,
          planExpiresAt: expirationDate
        }
      },
      { new: true }
    )

    if (!updateUserPlan) return _r.error({ req, res, code: 400, message: 'User not found' })

    _r.success({
      req,
      res,
      code: 201,
      payload: {
        plan: args.plan,
        planExpiresAt: expirationDate
      },
      message:
        updateUserPlan.firstName +
        ' ' +
        updateUserPlan.lastName +
        ' plan renewed to ' +
        (duration > 1 ? 'years' : 'year') +
        ' subscription successfully'
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} id
 */
module.exports.fetchPaymentId = async (req, res) => {
  try {
    const { id } = req.bind.user

    const getUserPaymentId = await Payment.findOne({ fkUserId: id }).sort({ createdAt: -1 })

    if (!getUserPaymentId) return _r.error({ req, res, code: 400, message: 'User Payment not found' })

    _r.success({
      req,
      res,
      code: 201,
      payload: {
        razorPayPaymentId: getUserPaymentId.razorPayPaymentId
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
