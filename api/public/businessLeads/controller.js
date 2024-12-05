const { _r } = require('express-tools')
const { BusinessLeads, Business } = require('../../../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

/**
 * @argument {String} contactPerson
 * @argument {Number} phoneNo
 * @argument {String} email
 * @argument {String} chatLink
 * @argument {String} city
 * @argument {ObjectId} fkBusinessId
 */

module.exports.create = async (req, res) => {
  try {
    const { args } = req.bind

    const getBusiness = await Business.findById(args.fkBusinessId)

    if (!getBusiness) return _r.error({ req, res, code: 400, message: 'Business not found' })

    const alreadyExists = await BusinessLeads.findOne({
      contactPerson: args.contactPerson,
      phoneNo: args.phoneNo,
      email: args.email,
      fkBusinessId: args.fkBusinessId
    })

    if (alreadyExists) return _r.error({ req, res, code: 400, message: 'Lead already exists' })

    let newLead = await BusinessLeads.create({ ...args })

    _r.success({ req, res, code: 201, message: 'Lead created successfully' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
