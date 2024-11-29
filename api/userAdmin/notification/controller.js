const { _r } = require('express-tools')
const { Notification } = require('../../../models')

/**
 * @argument {String} notification
 */
module.exports.create = async (req, res) => {
  try {
    let { args } = req.bind
    args.fkUserId = req.bind.user.id

    let newNotification = await Notification.create({ ...args })

    _r.success({ req, res, code: 201, message: 'Notification created successfully' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {Number} perPage
 * @argument {Number} pageNo
 * @argument {String} filter
 */
module.exports.fetchAll = async (req, res) => {
  try {
    const { args } = req.bind
    let fkUserId = req.bind.user.id
    let searchFilter = {}

    searchFilter.fkUserId = fkUserId
    if (args.filter === 'New') searchFilter.isMarkedRead = false
    if (args.filter === 'Read') searchFilter.isMarkedRead = true

    const getAllNotificationsCount = await Notification.count(searchFilter)

    const getAllNotifications = await Notification.find(searchFilter)
      .sort({ createdAt: -1 })
      .limit(args.perPage || 10)
      .skip(args.pageNo > 1 ? (args.perPage || 10) * (args.pageNo - 1) : 0)

    if (!getAllNotifications.length) {
      return _r.error({ req, res, code: 400, message: 'Notifications not found' })
    }

    _r.success({
      req,
      res,
      code: 200,
      payload: { total: getAllNotificationsCount, notifications: getAllNotifications }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} id
 */

module.exports.markAsRead = async (req, res) => {
  try {
    const { args } = req.bind

    const markReadNotification = await Notification.findByIdAndUpdate(
      args.id,
      {
        $set: {
          isMarkedRead: true
        }
      },
      { new: true }
    )
    if (!markReadNotification) {
      return _r.error({ req, res, code: 400, message: 'Notification not found' })
    }

    _r.success({ req, res, code: 201, message: 'Notification marked as read successfully', payload: {} })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} fkUserId
 */

module.exports.markAllAsRead = async (req, res) => {
  try {
    let { args } = req.bind
    args.fkUserId = req.bind.user.id

    const markAllNotificationsAsRead = await Notification.updateMany(
      { fkUserId: args.fkUserId },
      {
        $set: {
          isMarkedRead: true
        }
      },
      { new: true }
    )
    if (!markAllNotificationsAsRead) {
      return _r.error({ req, res, code: 400, message: 'Notifications not found' })
    }

    _r.success({ req, res, code: 201, message: 'All notifications are marked as read successfully', payload: {} })
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

    const deleteNotification = await Notification.findByIdAndDelete(args.id)

    if (!deleteNotification) return _r.error({ req, res, code: 400, message: 'Notification not found' })

    _r.success({ req, res, code: 201, message: 'Notification deleted successfully', payload: {} })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} fkUserId
 */

module.exports.deleteAll = async (req, res) => {
  try {
    const { args } = req.bind
    args.fkUserId = req.bind.user.id

    const deleteAllNotifications = await Notification.deleteMany({ fkUserId: args.fkUserId })

    if (!deleteAllNotifications) return _r.error({ req, res, code: 400, message: 'Notification not found' })

    _r.success({ req, res, code: 201, message: 'Notifications deleted successfully', payload: {} })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} fkUserId
 */

module.exports.count = async (req, res) => {
  try {
    let fkUserId = req.bind.user.id
    let searchFilter = {}
    searchFilter.fkUserId = fkUserId
    searchFilter.isMarkedRead = false

    const getAllNotificationsCount = await Notification.count(searchFilter)

    if (!getAllNotificationsCount) {
      return _r.error({ req, res, code: 400, message: 'Notifications not found' })
    }

    _r.success({ req, res, code: 201, message: '', payload: { total: getAllNotificationsCount } })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
