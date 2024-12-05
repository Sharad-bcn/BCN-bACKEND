const { _r } = require('express-tools')
const { Testimony } = require('../../../models')

/**
 * @argument {Array.<Object.<String,String,String,String,String>} oldTestimonies,_id,testimony,name,designation,image
 * @argument {Array.<Object.<String,String,String,String>} testimonies,testimony,name,designation,image
 */
module.exports.update = async (req, res) => {
  try {
    let { args } = req.bind

    if (args.oldTestimonies.length) {
      for (const updatedTestimony of args.oldTestimonies) {
        await Testimony.findOneAndUpdate(
          { _id: updatedTestimony._id, isPublic: true },
          {
            $set: {
              name: updatedTestimony.name,
              designation: updatedTestimony.designation,
              image: updatedTestimony.image,
              testimony: updatedTestimony.testimony
            }
          }
        )
      }

      await Testimony.updateMany(
        { _id: { $nin: args.oldTestimonies.map(testimony => testimony._id) } },
        { $set: { isPublic: false, deletedAt: Date.now() } }
      )

      if (args.testimonies.length) await Testimony.create(args.testimonies)
    } else {
      // If no subcategories provided, delete all existing subcategories
      await Testimony.updateMany({ isPublic: true }, { $set: { isPublic: false, deletedAt: Date.now() } })
    }

    _r.success({
      req,
      res,
      code: 201,
      message: 'Testimonies updated successfully'
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.fetch = async (req, res) => {
  try {
    // Fetch subcategories for the specified category
    const testimonies = await Testimony.find({ isPublic: true }, '-createdAt -updatedAt -__v -isPublic')
      .sort({ createdAt: -1 })
      .lean()

    if (!testimonies) return _r.error({ req, res, code: 404, message: 'Testimonies not found' })

    _r.success({
      req,
      res,
      code: 201,
      payload: {
        testimonies
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
