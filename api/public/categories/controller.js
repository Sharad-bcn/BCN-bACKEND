const { _r } = require('express-tools')
const { Category, SubCategory, Business, Listing } = require('../../../models')

module.exports.fetchAllCategories = async (req, res) => {
  try {
    const getCategoriesCount = await Category.count({ isPublic: true })

    const getAllCategories = await Category.find({ isPublic: true }, 'category image')

    if (!getAllCategories.length) return _r.error({ req, res, code: 400, message: 'Categories not found' })

    _r.success({ req, res, code: 200, payload: { total: getCategoriesCount, categories: getAllCategories } })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.fetchAllSubCategories = async (req, res) => {
  try {
    const getSubCategoriesCount = await SubCategory.count({ isPublic: true })

    const getAllSubCategories = await SubCategory.find({ isPublic: true }, 'subCategory fkCategoryId image')

    if (!getAllSubCategories.length) return _r.error({ req, res, code: 400, message: 'Sub Categories not found' })

    // Extract unique fkCategoryId values from subcategories
    const fkCategoryIds = [...new Set(getAllSubCategories.map(subCategory => subCategory.fkCategoryId))]

    // Find categories whose IDs match subcategory fkCategoryIds
    let categories = await Category.find({ _id: { $in: fkCategoryIds }, isPublic: true }, 'category')
      .sort({
        createdAt: -1
      })
      .lean()

    for (let cat of categories) {
      let views = 0

      const getBusinessesWithThisCategory = await Business.find({
        category: cat.category,
        isPublic: true,
        isApproved: true
      })

      getBusinessesWithThisCategory.forEach(business => {
        views = views + business.views
      })

      const getAllListings = await Listing.find({
        category: cat.category,
        isActive: true,
        isPublic: true,
        isApproved: true
      })

      getAllListings.forEach(listing => {
        views = views + listing.views
      })

      cat.views = views
    }

    const topCategories = categories.sort((a, b) => b.views - a.views).slice(0, 4)

    // Merge category data into subcategory documents
    const subCategoriesWithCategories = topCategories.map(category => ({
      category: category.category,
      subCategoriesData: getAllSubCategories
        .filter(subCategory => subCategory.fkCategoryId.toString() === category._id.toString())
        .map(subCategory => ({
          subCategory: subCategory.subCategory,
          image: subCategory.image
        }))
    }))

    _r.success({
      req,
      res,
      code: 200,
      payload: { total: getSubCategoriesCount, subCategories: subCategoriesWithCategories }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
