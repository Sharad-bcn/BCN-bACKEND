const { _r } = require('express-tools')
const { BusinessLeads } = require('../../../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

/**
 * @argument {ObjectId} fkBusinessId
 */

module.exports.fetchAll = async (req, res) => {
  try {
    const { args } = req.bind

    const getAllLeadsCount = await BusinessLeads.count({ fkBusinessId: args.fkBusinessId })

    const getAllLeads = await BusinessLeads.find(
      {
        fkBusinessId: args.fkBusinessId
      },
      '-__v -updatedAt'
    )

    if (!getAllLeads.length) return _r.error({ req, res, code: 400, message: 'Leads not found' })

    _r.success({ req, res, code: 200, payload: { total: getAllLeadsCount, leads: getAllLeads } })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
