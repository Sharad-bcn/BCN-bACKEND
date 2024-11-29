const mongoose = require('mongoose')
const { Schema } = mongoose

const ActiveAdminsSchema = new Schema(
  {
    token: {
      type: String,
      required: true
    },
    fkAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admin',
      required: true
    }
  },
  { timestamps: true }
)

const ActiveAdmins = mongoose.model('activeAdmins', ActiveAdminsSchema)
module.exports = ActiveAdmins
