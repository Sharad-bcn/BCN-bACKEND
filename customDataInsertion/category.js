const mongoose = require('mongoose')
const { Category } = require('../models') // Adjust the path to your State model file

const categoryData = [
  {
    category: 'Hospitality',
    image: 'Hospitality'
  },
  {
    category: 'Healthcare',
    image: 'Healthcare'
  },
  {
    category: 'Retail',
    image: 'Retail'
  },
  {
    category: 'Travel & Transport',
    image: 'TravelTransport'
  },
  {
    category: 'Education',
    image: 'Education'
  },
  {
    category: 'Event Management',
    image: 'EventManagement'
  },
  {
    category: 'Banking & Finance',
    image: 'BankingFinance'
  },
  {
    category: 'Media & Technology',
    image: 'MediaTechnology'
  },
  {
    category: 'Consumer Goods & Distribution',
    image: 'ConsumerGoodsDistribution'
  },
  {
    category: 'Energy Recources &Utilities',
    image: 'EnergyRecourcesUtilities'
  },
  {
    category: 'Insurance',
    image: 'Insurance'
  },
  {
    category: 'Manufacturing',
    image: 'Manufacturing'
  },
  {
    category: 'Legal',
    image: 'Legal'
  },
  {
    category: 'Marketing & Advertisment',
    image: 'MarketingAdvertisment'
  },
  {
    category: 'Infrastructure',
    image: 'Infrastructure'
  },
  {
    category: 'International',
    image: 'International'
  },
  {
    category: 'Agricultural',
    image: 'Agricultural'
  },
  {
    category: 'Ecommerce',
    image: 'Ecommerce'
  },
  {
    category: 'Sports',
    image: 'Sports'
  },
  {
    category: 'Textile',
    image: 'Textile'
  },
  {
    category: 'Research',
    image: 'Research'
  },
  {
    category: 'Culture',
    image: 'Culture'
  },
  {
    category: 'Publication',
    image: 'Publication'
  },
  {
    category: 'Innovation',
    image: 'Innovation'
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
      const insertedCategories = await Category.insertMany(categoryData)
      console.log(`Inserted ${insertedCategories.length} categories.`)
    } catch (err) {
      console.error('Error inserting states:', err)
    } finally {
      mongoose.connection.close()
    }
  }

  insertStates()
})
