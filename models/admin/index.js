const mongoose = require('mongoose')
const { Schema } = mongoose

const AdminSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      default: null,
      sparse: true,
      unique: true
    },
    phoneNo: {
      type: Number,
      required: true,
      unique: true
    },
    pin: {
      type: String,
      required: true
    },
    profilePic: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    deletedAt: {
      type: Date
    },
    isSuperAdmin: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

const Admin = mongoose.model('admin', AdminSchema)
module.exports = Admin
