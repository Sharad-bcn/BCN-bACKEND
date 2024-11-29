const mongoose = require('mongoose')
const { Schema } = mongoose

const CategorySchema = new Schema(
  {
    category: {
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

const Category = mongoose.model('category', CategorySchema)
module.exports = Category
