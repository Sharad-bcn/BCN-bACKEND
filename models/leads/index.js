const mongoose = require('mongoose')
const { Schema } = mongoose

const LeadsSchema = new Schema(
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
    fkListingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'listing',
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

const Leads = mongoose.model('leads', LeadsSchema)
module.exports = Leads
