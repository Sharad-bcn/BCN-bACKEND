const mongoose = require('mongoose')
const { Schema } = mongoose

const FaqSchema = new Schema(
  {
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
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

const Faq = mongoose.model('faq', FaqSchema)
module.exports = Faq
