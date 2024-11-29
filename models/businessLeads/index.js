const mongoose = require('mongoose')
const { Schema } = mongoose

const BusinessLeadsSchema = new Schema(
  {
    contactPerson: {
      type: String,
      required: true
    },
    phoneNo: {
      type: Number,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    query: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    fkBusinessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'business',
      required: true
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    deletedAt: {
      type: Date
    }
  },
  { timestamps: true }
)

const BusinessLeads = mongoose.model('businessLeads', BusinessLeadsSchema)
module.exports = BusinessLeads
