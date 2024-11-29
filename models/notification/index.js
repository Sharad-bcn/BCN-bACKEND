const mongoose = require('mongoose')
const { Schema } = mongoose

const NotificationSchema = new Schema(
  {
    notification: {
      type: String,
      required: true
    },
    isMarkedRead: {
      type: Boolean,
      default: false
    },
    redirect: {
      type: String,
      default: ''
    },
    fkUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }
  },
  { timestamps: true }
)

const Notification = mongoose.model('notification', NotificationSchema)
module.exports = Notification
