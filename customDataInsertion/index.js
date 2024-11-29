const mongoose = require('mongoose')
const { State, City } = require('../models') // Adjust the path to your State model file

const data = []
const MONGO_URI = 'mongodb://localhost:27017/BCN?directConnection=true'
mongoose.set('strictQuery', false)
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection

db.on('error', err => {
  console.error('MongoDB connection error:', err)
})

db.once('open', () => {
  console.log('Connected to MongoDB')

  async function insert() {
    try {
      // const deleteStates =  await State.deleteMany()
      // const deleteCities = await City.deleteMany()

      for (let i = 0; i < data.length; i++) {
        const state = data[i]
        const stateLocation = {
          type: 'Point',
          coordinates: [state.longitude, state.latitude] // Note the order: [longitude, latitude]
        }
        const insertState = await State.create({ state: state.name, location: stateLocation })

        for (j = 0; j < state.cities.length; j++) {
          const city = state.cities[j]
          const cityLocation = {
            type: 'Point',
            coordinates: [city.longitude, city.latitude] // Note the order: [longitude, latitude]
          }
          const insertCity = await City.create({ city: city.name, location: cityLocation, fkStateId: insertState._id })
        }
      }
      const insertedStates = await State.insertMany(statesData)
      console.log(`Inserted ${insertedStates.length} states.`)
      const insertedCities = await City.insertMany(cityData)
      console.log(`Inserted ${insertedCities.length} cities.`)
    } catch (err) {
      console.error('Error inserting:', err)
    } finally {
      mongoose.connection.close()
    }
  }

  insert()
})
