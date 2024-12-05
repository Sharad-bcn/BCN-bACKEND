const { _r, _env } = require('express-tools')
const { Admin } = require('../../../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const jwt = require('jsonwebtoken')
const JWT_SECRET = _env('JWT_SECRET')

/**
 * @argument {String} firstName
 * @argument {String} lastName
 * @argument {Number} phoneNo
 * @argument {String} email
 * @argument {String} pin
 * @argument {String} profilePic
 */
module.exports.create = async (req, res) => {
  try {
    let { args } = req.bind

    const checkIfSuperAdmin = await Admin.findById(req.bind.admin.id, '-pin')

    if (!checkIfSuperAdmin.isSuperAdmin)
      return _r.error({ req, res, code: 400, message: 'Only super admin can create admins' })

    let filter = {
      phoneNo: args.phoneNo
    }

    if (args.email) {
      filter.email = args.email
    } else {
      args.email = null
    }

    const alreadyExists = await Admin.findOne(filter)

    if (alreadyExists) return _r.error({ req, res, code: 400, message: 'Admin already exists' })

    let newAdmin = await Admin.create(args)

    const data = {
      admin: {
        id: newAdmin.id
      }
    }

    const authentication = jwt.sign(data, JWT_SECRET, {
      expiresIn: '30d'
    })

    _r.success({
      req,
      res,
      code: 201,
      message: newAdmin.firstName + ' added as admin successfully',
      payload: {
        authentication,
        adminData: {
          name: newAdmin.firstName + ' ' + newAdmin.lastName,
          profilePic: newAdmin.profilePic,
          access: newAdmin.isSuperAdmin ? 'superAdmin' : 'admin'
        }
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {String} firstName
 * @argument {String} lastName
 * @argument {Number} phoneNo
 * @argument {String} email
 * @argument {String} profilePic
 */

module.exports.update = async (req, res) => {
  try {
    let { args } = req.bind

    args.id = req.bind.admin.id

    let updateAdmin = await Admin.findByIdAndUpdate(args.id, { $set: args }, { new: true })

    if (!updateAdmin) return _r.error({ req, res, code: 400, message: 'Admin not found' })

    _r.success({ req, res, code: 201, message: 'Admin updated successfully' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} id
 */
module.exports.fetch = async (req, res) => {
  try {
    const { id } = req.bind.admin

    const getAdmin = await Admin.findById(id, '-pin')

    if (!getAdmin) return _r.error({ req, res, code: 400, message: 'Admin not found' })

    _r.success({
      req,
      res,
      code: 200,
      payload: {
        getAdmin
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} id
 * @argument {String} oldPin
 * @argument {String} newPin
 */
module.exports.changePin = async (req, res) => {
  try {
    const { args } = req.bind

    if (!args.id) args.id = req.bind.admin.id
    else {
      const checkIfSuperAdmin = await Admin.findById(req.bind.admin.id, '-pin')

      if (!checkIfSuperAdmin.isSuperAdmin)
        return _r.error({ req, res, code: 400, message: 'Only super admin can change other admins pin' })
    }

    let fetchAdmin = await Admin.findById(args.id)

    if (!fetchAdmin) return _r.error({ req, res, code: 400, message: 'Admin not found' })

    if (fetchAdmin.pin !== args.oldPin) return _r.error({ req, res, code: 400, message: 'Incorrect Old Pin' })

    let updateAdminPin = await Admin.findByIdAndUpdate(args.id, { $set: { pin: args.newPin } }, { new: true })

    _r.success({
      req,
      res,
      code: 201,
      message: fetchAdmin.firstName + ' ' + fetchAdmin.lastName + "'s Pin updated successfully"
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {Number} limit
 * @argument {Number} pageNo
 * @argument {String} searchQuery
 */
module.exports.fetchAll = async (req, res) => {
  try {
    const { args } = req.bind

    const checkIfSuperAdmin = await Admin.findById(req.bind.admin.id, '-pin')

    if (!checkIfSuperAdmin.isSuperAdmin)
      return _r.error({ req, res, code: 400, message: 'Only super admin can fetch all admins' })

    let searchFilter = {}
    const searchQuery = new RegExp(args.searchQuery, 'i')

    if (searchQuery) searchFilter.$or = [{ firstName: searchQuery }, { lastName: searchQuery }]
    searchFilter.isSuperAdmin = false
    searchFilter.isActive = true

    const getAllAdminCount = await Admin.count(searchFilter)

    const getAllAdmins = await Admin.find(searchFilter, '-pin -__v', { lean: true })
      .sort({ createdAt: -1 })
      .limit(args.limit || 10)
      .skip(args.pageNo > 1 ? (args.limit || 10) * (args.pageNo - 1) : 0)

    if (!getAllAdmins.length) return _r.error({ req, res, code: 400, message: 'Admins not found' })

    _r.success({ req, res, code: 200, payload: { total: getAllAdminCount, Admins: getAllAdmins } })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} id
 */
module.exports.delete = async (req, res) => {
  try {
    const { args } = req.bind

    const existingAdmin = await Admin.findOne({ _id: args.id, isActive: true })

    if (!existingAdmin) return _r.error({ req, res, code: 400, message: 'Admin not found' })

    const deleteAdmin = await Admin.findByIdAndUpdate(args.id, {
      deletedAt: Date.now(),
      isActive: false
    })

    if (!deleteAdmin) return _r.error({ req, res, code: 400, message: 'Admin not found' })

    _r.success({ req, res, code: 200, message: existingAdmin.firstName + ' deleted successfully' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
