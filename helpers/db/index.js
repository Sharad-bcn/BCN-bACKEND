const mongoose = require('mongoose')
const { _env } = require('express-tools')

const MONGO_URI = _env('MONGO_URI')

mongoose.set('strictQuery', false)

const connectDb = () => {
  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
      // autoIndex: true
      // useCreateIndex: true
    })
    .then(() => {
      console.log('Connected to DB Successfully')
    })
    .catch(error => {
      console.error('Error connecting to DB:', error)
    })
}

module.exports = connectDb
