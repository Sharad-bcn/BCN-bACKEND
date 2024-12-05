const { _r } = require('express-tools')
const { Business, User, Leads, LandingPage, Testimony, Faq } = require('../../../models')

module.exports.fetchCommonInfo = async (req, res) => {
  try {
    const usersCount = await User.count({})
    // const citiesCount = await City.count({})
    const citiesCount = await User.distinct('city')
    const businessesCount = await Business.count({ isPublic: true })
    const leadsCount = await Leads.count({})

    _r.success({
      req,
      res,
      code: 200,
      payload: { usersCount, citiesCount: citiesCount.length, businessesCount, leadsCount }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.fetchBanners = async (req, res) => {
  try {
    const bannersData = await LandingPage.findOne({}, 'banners links -_id')

    _r.success({
      req,
      res,
      code: 200,
      payload: { bannersData }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.fetchTermsAndConditions = async (req, res) => {
  try {
    const termsAndConditions = await LandingPage.findOne({}, 'termsAndConditions -_id')

    _r.success({
      req,
      res,
      code: 200,
      payload: { termsAndConditions: termsAndConditions.termsAndConditions }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.fetchPrivacyPolicy = async (req, res) => {
  try {
    const privacyPolicy = await LandingPage.findOne({}, 'privacyPolicy -_id')

    _r.success({
      req,
      res,
      code: 200,
      payload: { privacyPolicy: privacyPolicy.privacyPolicy }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.fetchSuccessStories = async (req, res) => {
  try {
    const successStories = await Testimony.find({ isPublic: true }, '-_id -isPublic')

    _r.success({
      req,
      res,
      code: 200,
      payload: { successStories }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.fetchFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find({ isPublic: true }, '-isPublic -_id')

    _r.success({
      req,
      res,
      code: 200,
      payload: { faqs }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.fetchContactInfo = async (req, res) => {
  try {
    const contactInfo = await LandingPage.findOne({}, 'phoneNo email -_id')

    _r.success({
      req,
      res,
      code: 200,
      payload: { websiteEmail: contactInfo.email, websitePhoneNo: contactInfo.phoneNo }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.fetchAboutUs = async (req, res) => {
  try {
    const aboutUs = await LandingPage.findOne({}, 'aboutUs -_id')

    _r.success({
      req,
      res,
      code: 200,
      payload: { aboutUs: aboutUs.aboutUs }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.fetchSocialLinks = async (req, res) => {
  try {
    const socailLinks = await LandingPage.findOne({}, 'whatsappLink instagramLink facebookLink -_id')

    _r.success({
      req,
      res,
      code: 200,
      payload: {
        whatsappLink: socailLinks.whatsappLink,
        instagramLink: socailLinks.instagramLink,
        facebookLink: socailLinks.facebookLink
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
