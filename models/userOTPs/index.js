const mongoose = require('mongoose')
const { Schema } = mongoose

const UserOTPsSchema = new Schema(
  {
    phoneNo: {
      type: Number,
      required: true
    },
    otp: {
      type: Number,
      required: true
    },
    otpType: {
      type: String,
      required: true,
      enum: ['RegisterUser', 'ResetPin']
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

const UserOTPs = mongoose.model('userOTPs', UserOTPsSchema)
module.exports = UserOTPs
