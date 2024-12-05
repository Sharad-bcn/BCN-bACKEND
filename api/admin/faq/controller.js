const { _r } = require('express-tools')
const { Faq } = require('../../../models')

/**
 * @argument {Array.<Object.<String,String>} faqs,question,answer
 */
module.exports.update = async (req, res) => {
  try {
    let { args } = req.bind

    await Faq.updateMany({ isPublic: true }, { $set: { isPublic: false, deletedAt: Date.now() } })

    if (args.faqs.length) await Faq.create(args.faqs)

    _r.success({
      req,
      res,
      code: 201,
      message: "Faq's updated successfully"
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.fetch = async (req, res) => {
  try {
    const faqs = await Faq.find({ isPublic: true }, '-createdAt -updatedAt -__v -_id -isPublic')
      .sort({ createdAt: -1 })
      .lean()

    if (!faqs.length) return _r.error({ req, res, code: 404, message: "Faq's not found" })

    _r.success({
      req,
      res,
      code: 201,
      payload: {
        faqs
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
