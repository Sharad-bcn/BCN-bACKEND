const mongoose = require('mongoose')
const { SubCategory } = require('../models') // Adjust the path to your State model file

const subCategoryData = [
  {
    subCategory: 'Hotels',
    image: 'Hotels',
    fkCategoryId: '6504dd6f143e0732a95f2291'
  },
  {
    subCategory: 'Restaurants',
    image: 'Restaurants',
    fkCategoryId: '6504dd6f143e0732a95f2291'
  },
  {
    subCategory: 'Resorts',
    image: 'Resorts',
    fkCategoryId: '6504dd6f143e0732a95f2291'
  },
  {
    subCategory: 'Marriage',
    image: 'Marriage',
    fkCategoryId: '6504dd6f143e0732a95f2296'
  },
  {
    subCategory: 'Sports',
    image: 'SportsTrending',
    fkCategoryId: '6504dd6f143e0732a95f2296'
  },
  {
    subCategory: 'Corporate',
    image: 'Corporate',
    fkCategoryId: '6504dd6f143e0732a95f2296'
  },
  {
    subCategory: 'Grocery',
    image: 'Grocery',
    fkCategoryId: '6504dd6f143e0732a95f2293'
  },
  {
    subCategory: 'Spare Parts',
    image: 'SpareParts',
    fkCategoryId: '6504dd6f143e0732a95f2293'
  },
  {
    subCategory: 'Supermarkets',
    image: 'Supermarkets',
    fkCategoryId: '6504dd6f143e0732a95f2293'
  },
  {
    subCategory: 'School /College',
    image: 'SchoolCollege',
    fkCategoryId: '6504dd6f143e0732a95f2295'
  },
  {
    subCategory: 'Coaching Institutes',
    image: 'CoachingInstitutes',
    fkCategoryId: '6504dd6f143e0732a95f2295'
  },
  {
    subCategory: 'Skill development',
    image: 'SkillDevelopment',
    fkCategoryId: '6504dd6f143e0732a95f2295'
  }
]

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

  async function insertStates() {
    try {
      //   const insertedStates = await State.insertMany(statesData)
      //   console.log(`Inserted ${insertedStates.length} states.`)
      const insertedSubCategories = await SubCategory.insertMany(subCategoryData)
      console.log(`Inserted ${insertedSubCategories.length} subCategories.`)
    } catch (err) {
      console.error('Error inserting states:', err)
    } finally {
      mongoose.connection.close()
    }
  }

  insertStates()
})
