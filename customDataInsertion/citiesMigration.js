const mongoose = require('mongoose')
const { City } = require('../models') // Import your City model

// Connect to your MongoDB database
mongoose.connect('mongodb://localhost:27017/BCN?directConnection=true', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

mongoose.set('strictQuery', false)

// Function to update a single city document
async function updateCity(city) {
  const { _id, lat, long } = city
  // Create a GeoJSON Point object
  const location = {
    type: 'Point',
    coordinates: [long, lat] // Note the order: [longitude, latitude]
  }

  try {
    // Update the document with the location field
    await City.findByIdAndUpdate(_id, { $set: { location } })

    // Remove the lat and long fields
    await City.findByIdAndUpdate(_id, { $unset: { lat: 1, long: 1 } })

    console.log(`Updated and removed fields for city: ${city.city}`)
  } catch (error) {
    console.error(`Error updating city: ${city.city}`, error)
  }
}

// Function to update all city documents
async function updateAllCities() {
  const cities = await City.find({})
  // Loop through each city and update it
  for (let i = 0; i < cities.length; i++) {
    await updateCity(cities[i])
  }

  console.log('Data migration completed.')
  mongoose.disconnect()
}

// Call the function to start the data migration
updateAllCities()
