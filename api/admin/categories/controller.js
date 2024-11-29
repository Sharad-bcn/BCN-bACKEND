const { _r } = require('express-tools')
const { Category, SubCategory, Business, BusinessLeads, Leads, Listing } = require('../../../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

/**
 * @argument {String} category
 * @argument {String} image
 * @argument {Array.<Object.<String,String>} subCategories,subCategory,image
 */
module.exports.create = async (req, res) => {
  try {
    let { args } = req.bind

    const categoryAlreadyExists = await Category.findOne({
      category: args.category,
      isPublic: true
    })

    if (categoryAlreadyExists) return _r.error({ req, res, code: 400, message: 'Category already exists' })

    let newCategory = await Category.create({ category: args.category, image: args.image })

    if (args.subCategories.length) {
      const subCategories = args.subCategories.map(subCategory => ({
        subCategory: subCategory.subCategory,
        image: subCategory.image,
        fkCategoryId: newCategory._id
      }))

      await SubCategory.create(subCategories)
    }

    _r.success({ req, res, code: 200, message: 'Category with SubCategories added successfully' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} categoryId
 * @argument {String} category
 * @argument {String} image
 * @argument {Array.<Object.<String,String>} oldSubCategories,subCategory,image
 * @argument {Array.<Object.<String,String>} subCategories,subCategory,image
 */
module.exports.update = async (req, res) => {
  try {
    let { args } = req.bind

    const getCategory = await Category.findOne({ _id: args.categoryId, isPublic: true })

    if (!getCategory) return _r.error({ req, res, code: 400, message: 'Category not found' })

    if (args.category !== getCategory.category) {
      const getCategoryBusiness = await Business.find({ category: getCategory.category })

      if (getCategoryBusiness.length) {
        await Business.updateMany(
          { _id: { $in: getCategoryBusiness.map(business => business._id) } },
          { $set: { category: args.category } }
        )
      }

      const getCategoryListings = await Listing.find({ category: getCategory.category })
      if (getCategoryListings.length) {
        await Listing.updateMany(
          { _id: { $in: getCategoryListings.map(listings => listings._id) } },
          { $set: { category: args.category } }
        )
      }
    }

    const updateCategory = await Category.findByIdAndUpdate(
      args.categoryId,
      { $set: { category: args.category, image: args.image } },
      { new: true }
    )

    for (const updatedSubcategory of args.oldSubCategories) {
      let oldSubCategory = await SubCategory.findById(updatedSubcategory._id)

      if (oldSubCategory.subCategory !== updatedSubcategory.subCategory) {
        const getSubCategoryBusiness = await Business.find({ subCategory: oldSubCategory.subCategory })

        if (getSubCategoryBusiness.length) {
          await Business.updateMany(
            { _id: { $in: getSubCategoryBusiness.map(business => business._id) } },
            { $set: { subCategory: updatedSubcategory.subCategory } }
          )
        }

        const getSubCategoryListings = await Listing.find({ subCategory: oldSubCategory.subCategory })
        if (getSubCategoryListings.length) {
          await Listing.updateMany(
            { _id: { $in: getSubCategoryListings.map(listings => listings._id) } },
            { $set: { subCategory: updatedSubcategory.subCategory } }
          )
        }

        await SubCategory.findByIdAndUpdate(updatedSubcategory._id, {
          $set: { subCategory: updatedSubcategory.subCategory, image: updatedSubcategory.image }
        })
      }
    }

    if (args.subCategories.length) {
      // Create new subcategories for the updated category
      const subcategoriesToAdd = args.subCategories.map(subCategory => ({
        subCategory: subCategory.subCategory,
        image: subCategory.image,
        fkCategoryId: args.categoryId // Associate with the updated category
      }))

      await SubCategory.create(subcategoriesToAdd)
    }
    _r.success({
      req,
      res,
      code: 200,
      message: 'Category ' + updateCategory.category + ' with subCategories updated successfully'
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} categoryId
 */
module.exports.fetch = async (req, res) => {
  try {
    let { args } = req.bind

    const category = await Category.findOne(
      { _id: args.categoryId, isPublic: true },
      '-createdAt -updatedAt -__v -isPublic'
    ).lean()

    if (!category) return _r.error({ req, res, code: 404, message: 'Category not found' })

    // Fetch subcategories for the specified category
    const subCategories = await SubCategory.find(
      { fkCategoryId: args.categoryId, isPublic: true },
      '-createdAt -updatedAt -__v -isPublic -fkCategoryId'
    ).lean()

    _r.success({
      req,
      res,
      code: 200,
      payload: {
        category,
        subCategories
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} categoryId
 */
module.exports.delete = async (req, res) => {
  try {
    let { args } = req.bind

    const category = await Category.findOne(
      { _id: args.categoryId, isPublic: true },
      '-createdAt -updatedAt -__v'
    ).lean()

    if (!category) return _r.error({ req, res, code: 404, message: 'Category not found' })

    // Delete the category and its subcategories
    await Category.findByIdAndUpdate(
      args.categoryId,
      { $set: { isPublic: false, deletedAt: Date.now() } },
      { new: true }
    )
    await SubCategory.updateMany(
      { fkCategoryId: args.categoryId },
      { $set: { isPublic: false, deletedAt: Date.now() } }
    )

    _r.success({
      req,
      res,
      code: 200,
      message: 'Category ' + category.category + ' with subCategories deleted successfully'
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} categoryId
 * @argument {String} state
 * @argument {String} city
 */
module.exports.fetchAnalytics = async (req, res) => {
  try {
    let { args } = req.bind

    let category = {
      views: 0,
      leads: 0,
      businesses: 0,
      listings: 0
    }

    let subCategories = []

    let query = {}

    if (args.state) query.state = args.state

    if (args.city) query.city = args.city

    const fetchCategory = await Category.findOne(
      { _id: args.categoryId, isPublic: true },
      '-createdAt -updatedAt -__v'
    ).lean()

    if (!fetchCategory) return _r.error({ req, res, code: 404, message: 'Category not found' })

    const getBusinessesWithThisCategory = await Business.find({
      category: fetchCategory.category,
      isPublic: true,
      isApproved: true,
      ...query
    })

    getBusinessesWithThisCategory.forEach(business => {
      category.views = category.views + business.views
    })

    category.businesses = getBusinessesWithThisCategory.length

    const businessIds = getBusinessesWithThisCategory.map(business => business._id)

    const getBusinessLeadsCount = await BusinessLeads.count({
      fkBusinessId: { $in: businessIds },
      isPublic: true
    })

    category.leads = category.leads + getBusinessLeadsCount

    const getAllListings = await Listing.find({
      fkBusinessId: { $in: businessIds },
      isActive: true,
      isPublic: true,
      isApproved: true
    })

    getAllListings.forEach(listing => {
      category.views = category.views + listing.views
    })

    category.listings = getAllListings.length

    const listingIds = getAllListings.map(listing => listing._id)

    const getListingLeadsCount = await Leads.count({
      fkListingId: { $in: listingIds },
      isPublic: true
    })

    category.leads = category.leads + getListingLeadsCount

    // Fetch subcategories for the specified category
    const fetchSubCategories = await SubCategory.find(
      { fkCategoryId: args.categoryId, isPublic: true },
      '-createdAt -updatedAt -__v -isPublic -_id -fkCategoryId'
    ).lean()

    for (let i = 0; i < fetchSubCategories.length; i++) {
      let SubCategoryObject = {
        subCategory: fetchSubCategories[i].subCategory,
        views: 0,
        leads: 0,
        businesses: 0,
        listings: 0
      }

      const getBusinessesWithThisSubCategory = await Business.find({
        subCategories: fetchSubCategories[i].subCategory,
        isPublic: true,
        isApproved: true,
        ...query
      })

      getBusinessesWithThisSubCategory.forEach(business => {
        SubCategoryObject.views = SubCategoryObject.views + business.views
      })

      SubCategoryObject.businesses = getBusinessesWithThisSubCategory.length

      const businessIds = getBusinessesWithThisSubCategory.map(business => business._id)

      const getBusinessLeadsCount = await BusinessLeads.count({
        fkBusinessId: { $in: businessIds },
        isPublic: true
      })

      SubCategoryObject.leads = SubCategoryObject.leads + getBusinessLeadsCount

      const getAllListings = await Listing.find({
        fkBusinessId: { $in: businessIds },
        isActive: true,
        isPublic: true,
        isApproved: true
      })

      getAllListings.forEach(listing => {
        SubCategoryObject.views = SubCategoryObject.views + listing.views
      })

      SubCategoryObject.listings = getAllListings.length

      const listingIds = getAllListings.map(listing => listing._id)

      const getListingLeadsCount = await Leads.count({
        fkListingId: { $in: listingIds },
        isPublic: true
      })

      SubCategoryObject.leads = SubCategoryObject.leads + getListingLeadsCount

      subCategories.push(SubCategoryObject)
    }

    _r.success({
      req,
      res,
      code: 200,
      payload: {
        category,
        subCategories
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
