const { _r } = require('express-tools')
const { SubCategory } = require('../../../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

/**
 * @argument {ObjectId} id
 */
module.exports.fetchSubCategoryViaCategory = async (req, res) => {
  try {
    const { args } = req.bind

    const getSubCategoriesCount = await SubCategory.count({ fkCategoryId: args.id, isPublic: true })

    const getAllSubCategories = await SubCategory.find(
      { fkCategoryId: args.id, isPublic: true },
      'subCategory fkCategoryId image'
    )

    if (!getAllSubCategories.length) return _r.error({ req, res, code: 400, message: 'Sub Categories not found' })

    _r.success({
      req,
      res,
      code: 200,
      payload: { total: getSubCategoriesCount, subCategories: getAllSubCategories }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
