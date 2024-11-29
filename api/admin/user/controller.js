const { _r } = require('express-tools')
const { User } = require('../../../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

/**
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

    args.plan = 'Plan 0'

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

    if (args.fkRefId) {
      const fkUserRefId = await User.findOne({ userRefId: args.fkRefId })

      if (!fkUserRefId) return _r.error({ req, res, code: 400, message: 'Reference id not found' })
      else args.fkRefId = fkUserRefId.userRefId
    }

    const duration = args.plan === 'Plan A' ? 1 : args.plan === 'Plan B' ? 5 : args.plan === 'Plan C' ? 10 : 0
    let expirationDate = new Date(Date.now())
    expirationDate.setFullYear(expirationDate.getFullYear() + duration)
    args.planExpiresAt = expirationDate

    let newUser = await User.create(args)

    _r.success({
      req,
      res,
      code: 201,
      message: newUser.firstName + ' registered successfully'
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} id
 */
module.exports.blockUser = async (req, res) => {
  try {
    const { args } = req.bind

    const getUser = await User.findById(args.id, '-pin')

    if (!getUser) return _r.error({ req, res, code: 400, message: 'User not found' })

    const updateUserStatus = await User.findByIdAndUpdate(
      args.id,
      { $set: { isBlocked: !getUser.isBlocked } },
      { new: true }
    )

    if (!updateUserStatus) return _r.error({ req, res, code: 400, message: 'User not found' })

    _r.success({
      req,
      res,
      code: 201,
      message: getUser.firstName + (!getUser.isBlocked ? ' is Blocked' : ' is Unblocked'),
      payload: {
        status: !getUser.isBlocked
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {Number} state
 * @argument {Number} city
 * @argument {Number} limit
 * @argument {Number} pageNo
 * @argument {String} searchQuery
 */
module.exports.fetchAll = async (req, res) => {
  try {
    const { args } = req.bind
    let searchFilter = {}
    const searchQuery = new RegExp(args.searchQuery, 'i')

    if (searchQuery) searchFilter.$or = [{ firstName: searchQuery }, { lastName: searchQuery }]
    if (args.state) searchFilter.state = args.state
    if (args.city) searchFilter.city = args.city

    const getAllUsersCount = await User.count(searchFilter)

    const getAllUsers = await User.find(searchFilter, '_id firstName lastName isBlocked logo createdAt', { lean: true })
      .sort({ createdAt: -1 })
      .limit(args.limit || 10)
      .skip(args.pageNo > 1 ? (args.limit || 10) * (args.pageNo - 1) : 0)

    if (!getAllUsers.length) return _r.error({ req, res, code: 400, message: 'Users not found' })

    _r.success({ req, res, code: 200, payload: { total: getAllUsersCount, Users: getAllUsers } })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} id
 * @argument {Boolean} isApproved
 * @argument {String} rejectionMessage
 */
module.exports.updateApprovalStatus = async (req, res) => {
  try {
    const { args } = req.bind

    const fetchUser = await User.findOne({ _id: args.id, approvalStatus: 'Pending' })

    if (!fetchUser) return _r.error({ req, res, code: 400, message: 'User not found' })

    if (fetchUser.isApproved) return _r.error({ req, res, code: 400, message: 'User Already Approved' })

    const updateUser = await User.findByIdAndUpdate(
      args.id,
      {
        $set: {
          isApproved: args.isApproved,
          approvalStatus: args.isApproved ? 'Approved' : 'Rejected',
          rejectionMessage: args.isApproved ? '' : args.rejectionMessage
        }
      },
      { new: true }
    )

    if (!updateUser) return _r.error({ req, res, code: 400, message: 'User not found' })

    _r.success({
      req,
      res,
      code: 201,
      message:
        updateUser.firstName +
        ' ' +
        updateUser.lastName +
        (updateUser.isApproved ? ' approved successfully' : ' approval rejected')
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {Number} perPage
 * @argument {Number} pageNo
 */
module.exports.fetchNewlyCreated = async (req, res) => {
  try {
    const { args } = req.bind

    const getUsersCount = await User.count({ isApproved: false, isBlocked: false, approvalStatus: 'Pending' })

    const getUsers = await User.find(
      { isBlocked: false, isApproved: false, approvalStatus: 'Pending' },
      'firstName lastName gender email address state city phoneNo logo updatedAt',
      {
        lean: true
      }
    )
      .sort({ updatedAt: -1 })
      .limit(args.perPage || 10)
      .skip(args.pageNo > 1 ? (args.perPage || 10) * (args.pageNo - 1) : 0)

    if (!getUsers) return _r.error({ req, res, code: 400, message: 'Users not found' })

    _r.success({
      req,
      res,
      code: 200,
      payload: {
        total: getUsersCount,
        Users: getUsers
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}