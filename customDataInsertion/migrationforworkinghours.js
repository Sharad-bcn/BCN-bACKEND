const mongoose = require('mongoose')
const { Business } = require('../models')

async function updateDocuments() {
  try {
    mongoose.set('strictQuery', false)

    await mongoose.connect('mongodb://localhost:27017/BCN?directConnection=true', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    // Find documents that lack the new fields
    const documentsToUpdate = await Business.find({
      $or: [
        { facebookLink: { $exists: false } },
        { instagramLink: { $exists: false } },
        { dateOfEstablishment: { $exists: false } },
        { workingHours: { $exists: false } }
      ]
    })

    // Update documents with the new fields
    for (const document of documentsToUpdate) {
      document.facebookLink = ''
      document.instagramLink = ''
      document.dateOfEstablishment = ''
      document.workingHours = [
        { day: 'Monday', from: '', to: '' },
        { day: 'Tuesday', from: '', to: '' },
        { day: 'Wednesday', from: '', to: '' },
        { day: 'Thursday', from: '', to: '' },
        { day: 'Friday', from: '', to: '' },
        { day: 'Saturday', from: '', to: '' },
        { day: 'Sunday', from: '', to: '' }
      ]

      await document.save()
    }

    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Error during migration:', error)
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect()
  }
}

// Run the migration script
updateDocuments()
