const mongoose = require('mongoose')
const { Schema } = mongoose

const ListingSchema = new Schema(
  {
    listingName: {
      type: String,
      required: true
    },
    images: [
      {
        type: String
      }
    ],
    description: {
      type: String,
      required: true
    },
    contactPerson: {
      type: String,
      required: true
    },
    phoneNo: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    subCategories: [
      {
        type: String
      }
    ],
    fkUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    businessName: {
      type: String,
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    fkBusinessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'business',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
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
    isBlocked: {
      type: Boolean,
      default: false
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

const Listing = mongoose.model('listing', ListingSchema)
module.exports = Listing
