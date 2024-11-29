const { _r } = require('express-tools')
const { Leads } = require('../../../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

/**
 * @argument {ObjectId} fkListingId
 */

module.exports.fetchAll = async (req, res) => {
  try {
    const { args } = req.bind

    const getAllLeadsCount = await Leads.count({ fkListingId: args.fkListingId })

    const getAllLeads = await Leads.find(
      {
        fkListingId: args.fkListingId
      },
      '-__v -updatedAt'
    )

    if (!getAllLeads.length) {
      return _r.error({ req, res, code: 400, message: 'Leads not found' })
    }

    _r.success({ req, res, code: 200, payload: { total: getAllLeadsCount, leads: getAllLeads } })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
