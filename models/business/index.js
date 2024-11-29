const mongoose = require('mongoose')
const { Schema } = mongoose

const BusinessSchema = new Schema(
  {
    businessName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    phoneNo: {
      type: Number,
      required: true
    },
    gst: {
      type: String
    },
    website: {
      type: String
    },
    fkUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
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
    state: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    pinCode: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    facebookLink: {
      type: String,
      default: ''
    },
    instagramLink: {
      type: String,
      default: ''
    },
    dateOfEstablishment: {
      type: String,
      default: ''
    },
    images: [
      {
        type: String
      }
    ],
    tags: [
      {
        type: String
      }
    ],
    workingHours: {
      timings: [
        {
          day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
          },
          from: {
            type: String,
            default: ''
          },
          to: {
            type: String,
            default: ''
          },
          isClosed: {
            type: Boolean,
            default: false
          }
        }
      ],
      isOpen24Hours: {
        type: Boolean,
        default: false
      }
    },
    views: {
      type: Number,
      default: 0
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // Note the order: [longitude, latitude]
        default: [0, 0]
      }
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

BusinessSchema.index({ location: '2dsphere' })

const Business = mongoose.model('business', BusinessSchema)
module.exports = Business
