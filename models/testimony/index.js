const mongoose = require('mongoose')
const { Schema } = mongoose

const TestimonySchema = new Schema(
  {
    testimony: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    designation: {
      type: String,
      required: true
    },
    image: {
      type: String
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

const Testimony = mongoose.model('testimony', TestimonySchema)
module.exports = Testimony
