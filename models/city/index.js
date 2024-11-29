const mongoose = require('mongoose')
const { Schema } = mongoose

const CitySchema = new Schema(
  {
    city: {
      type: String,
      required: true
    },
    fkStateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'state',
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number], // Note the order: [longitude, latitude]
        required: true
      }
    }
  },
  { timestamps: true }
)

CitySchema.index({ location: '2dsphere' })

const City = mongoose.model('city', CitySchema)
module.exports = City
