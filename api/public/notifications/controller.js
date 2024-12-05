const { _r } = require('express-tools')
const { Notification } = require('../../../models')

/**
 * @argument {String} notification
 * @argument {String} fkUserId
 * @argument {String} redirect
 */
module.exports.create = async (req, res) => {
  try {
    let { args } = req.bind

    let newNotification = await Notification.create({ ...args })

    _r.success({ req, res, code: 201, message: 'Notification created successfully' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
