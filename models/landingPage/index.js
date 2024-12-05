const mongoose = require('mongoose')
const { Schema } = mongoose

const LandingPageSchema = new Schema(
  {
    banners: [
      {
        type: String
      }
    ],
    links: [
      {
        type: String
      }
    ],
    aboutUs: {
      type: String
    },
    privacyPolicy: {
      type: String
    },
    termsAndConditions: {
      type: String
    },
    phoneNo: {
      type: Number
    },
    email: {
      type: String
    },
    instagramLink: {
      type: String
    },
    facebookLink: {
      type: String
    },
    whatsappLink: {
      type: String
    }
  },
  { timestamps: true }
)

const LandingPage = mongoose.model('landingPage', LandingPageSchema)
module.exports = LandingPage
