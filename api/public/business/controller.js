const { _r } = require('express-tools')
const { Business, Listing } = require('../../../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

/**
 * @argument {ObjectId} id
 */
module.exports.fetch = async (req, res) => {
  try {
    const { args } = req.bind

    let getBusiness = await Business.findById(args.id, '-__v -gst -createdAt -updatedAt', { lean: true })

    if (!getBusiness) return _r.error({ req, res, code: 400, message: 'Business not found' })

    if (!getBusiness.isPublic) return _r.error({ req, res, code: 400, message: 'Business not found' })

    if (!getBusiness.isApproved) return _r.error({ req, res, code: 400, message: 'Business is under review' })

    const listingsCount = await Listing.count({
      fkBusinessId: args.id,
      isPublic: true,
      isApproved: true,
      isActive: true
    })
    getBusiness.listingsCount = listingsCount

    if (getBusiness) {
      getBusiness.workingHours.timings = getBusiness.workingHours.timings.map(workingHour => {
        const { _id, ...rest } = workingHour // Exclude _id from workingHours object
        return rest
      })
    }

    _r.success({ req, res, code: 200, payload: { getBusiness }, message: '' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

module.exports.fetchBusinessLocations = async (req, res) => {
  try {
    let getBusinessLocations = await Business.find(
      { 'location.coordinates': { $ne: [0, 0] }, isApproved: true, isPublic: true },
      'businessName location city subCategory images',
      { lean: true }
    )

    if (!getBusinessLocations) return _r.error({ req, res, code: 400, message: 'Business Locations not found' })

    _r.success({ req, res, code: 200, payload: { getBusinessLocations }, message: '' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {String} city
 * @argument {String} filter
 * @argument {String} category
 * @argument {String} subCategory
 * @argument {Number} limit
 * @argument {Number} pageNo
 */
module.exports.fetchAll = async (req, res) => {
  try {
    const { args } = req.bind

    let cityFilter = {
      isPublic: true,
      isApproved: true
    }

    if (args.city !== 'All Over India') cityFilter.city = args.city

    let sort = {}

    if (args.filter === 'Date, new to old') sort.createdAt = -1

    if (args.filter === 'Date, old to new') sort.createdAt = 1

    if (args.filter === 'Alphabetically A-Z') sort.businessName = 1

    if (args.filter === 'Alphabetically Z-A') sort.businessName = -1

    const getAllBusinessCount = await Business.count({
      ...cityFilter,
      $or: [
        { category: null, subCategories: [] },
        { category: new RegExp(args.category, 'i'), subCategories: [] },
        { category: new RegExp(args.category, 'i'), subCategories: new RegExp(args.subCategory, 'i') }
      ]
    })

    const getAllBusiness = await Business.find(
      {
        ...cityFilter,
        $or: [
          { category: null, subCategories: [] },
          { category: new RegExp(args.category, 'i'), subCategories: [] },
          { category: new RegExp(args.category, 'i'), subCategories: new RegExp(args.subCategory, 'i') }
        ]
      },
      'businessName description phoneNo website fkUserId address createdAt dateOfEstablishment images',
      { lean: true }
    )
      .sort(sort)
      .limit(args.limit || 10)
      .skip(args.pageNo > 1 ? (args.limit || 10) * (args.pageNo - 1) : 0)

    if (!getAllBusiness.length) return _r.error({ req, res, code: 400, message: 'Businesses not found' })

    _r.success({ req, res, code: 200, payload: { total: getAllBusinessCount, Businesses: getAllBusiness } })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {String} city
 * @argument {String} filter
 * @argument {String} category
 * @argument {String} subCategory
 * @argument {Number} limit
 * @argument {Number} pageNo
 */
module.exports.fetchAllBusinessWithNoListings = async (req, res) => {
  try {
    const { args } = req.bind

    let cityFilter = {
      isPublic: true,
      isApproved: true
    }

    if (args.city !== 'All Over India') cityFilter.city = args.city

    let sort = {}

    if (args.filter === 'Date, new to old') sort.createdAt = -1

    if (args.filter === 'Date, old to new') sort.createdAt = 1

    if (args.filter === 'Alphabetically A-Z') sort.businessName = 1

    if (args.filter === 'Alphabetically Z-A') sort.businessName = -1

    const getAllBusinessCount = await Business.count({
      ...cityFilter,
      $or: [
        { category: null, subCategories: [] },
        { category: new RegExp(args.category, 'i'), subCategories: [] },
        { category: new RegExp(args.category, 'i'), subCategories: new RegExp(args.subCategory, 'i') }
      ],
      _id: { $nin: await Listing.distinct('fkBusinessId') }
    })

    const getAllBusiness = await Business.find(
      {
        ...cityFilter,
        $or: [
          { category: null, subCategories: [] },
          { category: new RegExp(args.category, 'i'), subCategories: [] },
          { category: new RegExp(args.category, 'i'), subCategories: new RegExp(args.subCategory, 'i') }
        ],
        _id: { $nin: await Listing.distinct('fkBusinessId') }
      },
      'businessName description phoneNo website fkUserId address createdAt dateOfEstablishment images',
      { lean: true }
    )
      .sort(sort)
      .limit(args.limit || 10)
      .skip(args.pageNo > 1 ? (args.limit || 10) * (args.pageNo - 1) : 0)

    if (!getAllBusiness.length) return _r.error({ req, res, code: 400, message: 'Businesses not found' })

    _r.success({ req, res, code: 200, payload: { total: getAllBusinessCount, Businesses: getAllBusiness } })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {String} searchQuery
 * @argument {String} city
 * @argument {String} filter
 * @argument {Number} limit
 * @argument {Number} pageNo
 */
module.exports.searchBusiness = async (req, res) => {
  try {
    const { args } = req.bind

    const searchQuery = new RegExp(args.searchQuery, 'i')

    let sort = {}

    if (args.filter === 'Date, new to old') sort.createdAt = -1

    if (args.filter === 'Date, old to new') sort.createdAt = 1

    if (args.filter === 'Alphabetically A-Z') sort.businessName = 1

    if (args.filter === 'Alphabetically Z-A') sort.businessName = -1

    const getAllSearchedBusinessCount = await Business.count({
      city: args.city,
      isPublic: true,
      isApproved: true,
      $or: [
        { businessName: searchQuery },
        { category: searchQuery },
        { subCategories: searchQuery },
        { tags: searchQuery }
      ]
    })

    const getAllSearchedBusiness = await Business.find(
      {
        city: args.city,
        isPublic: true,
        isApproved: true,
        $or: [
          { businessName: searchQuery },
          { category: searchQuery },
          { subCategories: searchQuery },
          { tags: searchQuery }
        ]
      },
      'businessName description phoneNo website fkUserId address createdAt dateOfEstablishment images',
      { lean: true }
    )
      .sort(sort)
      .limit(args.limit || 10)
      .skip(args.pageNo > 1 ? (args.limit || 10) * (args.pageNo - 1) : 0)

    if (!getAllSearchedBusiness.length) return _r.error({ req, res, code: 400, message: 'Businesses not found' })

    _r.success({
      req,
      res,
      code: 200,
      payload: { total: getAllSearchedBusinessCount, Businesses: getAllSearchedBusiness }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} fkUserId
 */
module.exports.fetchProfileBusinesses = async (req, res) => {
  try {
    const { args } = req.bind

    let getBusiness = await Business.find(
      { fkUserId: args.fkUserId, isApproved: true, isPublic: true },
      'businessName description address images phoneNo fkUserId website location',
      {
        lean: true
      }
    )

    if (!getBusiness) return _r.error({ req, res, code: 400, message: 'Businesses not found' })

    _r.success({ req, res, code: 200, payload: { getBusiness }, message: '' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} fkBusinessId
 */

module.exports.updateViews = async (req, res) => {
  try {
    const { args } = req.bind

    const getBusiness = await Business.findById(args.fkBusinessId)

    if (!getBusiness) return _r.error({ req, res, code: 400, message: 'Business not found' })

    const updateBusinessViews = await Business.findByIdAndUpdate(
      args.fkBusinessId,
      { $set: { views: getBusiness.views + 1 } },
      { new: true }
    )
    if (!updateBusinessViews) return _r.error({ req, res, code: 400, message: 'Business not found' })

    _r.success({ req, res, code: 201, message: 'Views updated successfully' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
