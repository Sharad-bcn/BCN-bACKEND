const { _r } = require('express-tools')
const { LandingPage } = require('../../../models')

/**
 * @argument {Array.<String>} banners
 * @argument {Array.<String>} links
 * @argument {String} aboutUs
 * @argument {String} privacyPolicy
 * @argument {String} termsAndConditions
 * @argument {Number} phoneNo
 * @argument {String} email
 * @argument {String} instagramLink
 * @argument {String} facebookLink
 * @argument {String} whatsappLink
 */
module.exports.update = async (req, res) => {
  try {
    let { args } = req.bind

    await LandingPage.updateMany({}, { $set: { ...args } })

    _r.success({
      req,
      res,
      code: 201,
      message: 'Demographics updated successfully'
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.fetch = async (req, res) => {
  try {
    const demographics = await LandingPage.find({}, '-createdAt -updatedAt -__v -_id').lean()

    if (!demographics.length) return _r.error({ req, res, code: 404, message: 'Demographics not found' })

    _r.success({
      req,
      res,
      code: 201,
      payload: {
        demographics: demographics[0]
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
