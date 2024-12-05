const { _r } = require('express-tools')
const { Leads, Listing } = require('../../../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

/**
 * @argument {String} contactPerson
 * @argument {Number} phoneNo
 * @argument {String} email
 * @argument {String} chatLink
 * @argument {String} city
 * @argument {ObjectId} fkListingId
 */

module.exports.create = async (req, res) => {
  try {
    const { args } = req.bind

    const getListing = await Listing.findById(args.fkListingId)

    if (!getListing) return _r.error({ req, res, code: 400, message: 'Offering not found' })

    const alreadyExists = await Leads.findOne({
      contactPerson: args.contactPerson,
      phoneNo: args.phoneNo,
      email: args.email,
      fkListingId: args.fkListingId
    })

    if (alreadyExists) return _r.error({ req, res, code: 400, message: 'Lead already exists' })

    let newLead = await Leads.create({ ...args })

    _r.success({ req, res, code: 201, message: 'Lead created successfully' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
