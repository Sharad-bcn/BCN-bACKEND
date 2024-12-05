const { _r, _env } = require('express-tools')
const { Admin, ActiveAdmins, User, ActiveUsers } = require('../../../models')
const jwt = require('jsonwebtoken')
const JWT_SECRET = _env('JWT_SECRET')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

/**
 * @argument {Number} phoneNo
 * @argument {Number} pin
 */

module.exports.logIn = async (req, res) => {
  try {
    const { args } = req.bind

    const authenticationHeader = req.headers.authentication
    if (authenticationHeader) _r.error({ req, res, code: 400, message: 'Admin already logged in' })

    let admin = await Admin.findOne({ phoneNo: args.phoneNo, pin: args.pin })

    if (!admin) return _r.error({ req, res, code: 400, message: 'Admin not found' })

    const data = {
      admin: { id: admin.id }
    }

    const authentication = jwt.sign(data, JWT_SECRET, {
      expiresIn: '30d'
    })

    const signInAdmin = await ActiveAdmins.create({
      token: authentication,
      fkAdminId: admin.id
    })

    _r.success({
      req,
      res,
      code: 201,
      message: admin.firstName + ' logged in successfully',
      payload: {
        authentication,
        adminData: {
          name: admin.firstName + ' ' + admin.lastName,
          profilePic: admin.profilePic,
          access: admin.isSuperAdmin ? 'superAdmin' : 'admin'
        }
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.getAdmin = async (req, res) => {
  try {
    // const admin = req.bind.admin
    _r.success({ req, res, code: 201, message: 'Admin already logged in' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} id
 */

module.exports.getUserAdmin = async (req, res) => {
  try {
    const { args } = req.bind

    let user = await User.findById(args.id)

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

module.exports.logOut = async (req, res) => {
  try {
    const authenticationHeader = req.headers.authentication

    let fetchActiveAdmin = await ActiveAdmins.findOne({ token: authenticationHeader })

    if (!fetchActiveAdmin) return _r.error({ req, res, code: 400, message: 'Active admin not found' })

    const currentActiveAdmin = await Admin.findById(req.bind.admin.id, 'firstName')

    let signOutActiveAdmin = await ActiveAdmins.deleteOne({ _id: fetchActiveAdmin.id })

    _r.success({ req, res, code: 201, message: currentActiveAdmin.firstName + ' logged out successfully' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
