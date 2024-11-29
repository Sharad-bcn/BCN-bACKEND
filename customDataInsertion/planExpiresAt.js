const mongoose = require('mongoose')
const { User } = require('../models') // Replace with the actual path to your user model file

async function updatePlanExpiresAt() {
  try {
    mongoose.set('strictQuery', false)

    await mongoose.connect('mongodb://localhost:27017/BCN?directConnection=true', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    const users = await User.find({}) // Fetch all user documents

    for (const user of users) {
      const duration = user.plan === 'Plan A' ? 1 : user.plan === 'Plan B' ? 5 : user.plan === 'Plan C' ? 10 : 0

      let expirationDate = new Date(user.createdAt)
      expirationDate.setFullYear(expirationDate.getFullYear() + duration)

      user.planExpiresAt = expirationDate
      await user.save() // Save the updated user document
    }

    console.log('Updated planExpiresAt for all users successfully.')
  } catch (error) {
    console.error('Error updating planExpiresAt:', error)
  } finally {
    mongoose.disconnect() // Close the MongoDB connection
  }
}

updatePlanExpiresAt()
