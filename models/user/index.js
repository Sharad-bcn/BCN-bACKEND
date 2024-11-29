const mongoose = require('mongoose')
const { Schema } = mongoose

const UserSchema = new Schema(
  {
    plan: {
      type: String,
      enum: ['Plan 0', 'Plan A', 'Plan B', 'Plan C'],
      default: 'Plan 0'
    },
    planExpiresAt: {
      type: Date,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      required: true
    },
    userRefId: {
      type: String,
      unique: true
    },
    email: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      required: true
    },
    phoneNo: {
      type: Number,
      required: true,
      unique: true
    },
    state: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    pinCode: {
      type: Number
    },
    fkRefId: {
      type: String,
      default: ''
    },
    pin: {
      type: String,
      required: true
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    approvalStatus: {
      type: String,
      enum: ['Approved', 'Pending', 'Rejected'],
      default: 'Pending'
    },
    rejectionMessage: {
      type: String
    },
    logo: {
      type: String
    },
    isNewUser: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

UserSchema.pre('save', function (next) {
  let currentDate = new Date()
  let formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${currentDate.getFullYear().toString().slice(-2)}`
  let referenceIdPrefix = formattedDate.split('/').join('')

  mongoose
    .model('user', UserSchema)
    .countDocuments({ userRefId: new RegExp('^' + referenceIdPrefix) }, (err, count) => {
      if (err) return next(err)
      let newReferenceId = `${referenceIdPrefix}${(count + 1).toString().padStart(4, '0')}`
      this.userRefId = newReferenceId
      next()
    })
})

const User = mongoose.model('user', UserSchema)
module.exports = User
