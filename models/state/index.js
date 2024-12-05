const mongoose = require('mongoose')
const { Schema } = mongoose

const StateSchema = new Schema(
  {
    state: {
      type: String,
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

const State = mongoose.model('state', StateSchema)
module.exports = State
