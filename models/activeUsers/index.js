const mongoose = require('mongoose')
const { Schema } = mongoose

const ActiveUsersSchema = new Schema(
  {
    token: {
      type: String,
      required: true
    },
    fkUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }
  },
  { timestamps: true }
)

const ActiveUsers = mongoose.model('activeUsers', ActiveUsersSchema)
module.exports = ActiveUsers
