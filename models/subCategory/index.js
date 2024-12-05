const mongoose = require('mongoose')
const { Schema } = mongoose

const SubCategorySchema = new Schema(
  {
    subCategory: {
      type: String,
      required: true
    },
    fkCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'category',
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

const SubCategory = mongoose.model('subCategory', SubCategorySchema)
module.exports = SubCategory
