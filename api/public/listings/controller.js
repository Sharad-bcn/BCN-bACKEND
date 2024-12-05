const { _r } = require('express-tools')
const { Listing, Business } = require('../../../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

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

    let businessFilter = {
      isPublic: true,
      isApproved: true
    }

    if (args.city !== 'All Over India') businessFilter.city = args.city

    const businesses = await Business.find(businessFilter)

    const businessIds = businesses.map(business => business._id)

    // Create a map of business data for efficient lookup by fkBusinessId
    const businessMap = new Map()
    businesses.forEach(business => {
      businessMap.set(business._id.toString(), business)
    })

    let sort = {}

    if (args.filter === 'Date, new to old') sort.createdAt = -1

    if (args.filter === 'Date, old to new') sort.createdAt = 1

    if (args.filter === 'Alphabetically A-Z') sort.listingName = 1

    if (args.filter === 'Alphabetically Z-A') sort.listingName = -1

    const getAllListingCount = await Listing.count({
      fkBusinessId: { $in: businessIds },
      isActive: true,
      isPublic: true,
      isApproved: true,
      $or: [
        { category: null, subCategories: [] },
        { category: new RegExp(args.category, 'i'), subCategories: [] },
        { category: new RegExp(args.category, 'i'), subCategories: new RegExp(args.subCategory, 'i') }
      ]
    })

    const getAllListing = await Listing.find({
      fkBusinessId: { $in: businessIds },
      isActive: true,
      isPublic: true,
      isApproved: true,
      $or: [
        { category: null, subCategories: [] },
        { category: new RegExp(args.category, 'i'), subCategories: [] },
        { category: new RegExp(args.category, 'i'), subCategories: new RegExp(args.subCategory, 'i') }
      ]
    })
      .sort(sort)
      .limit(args.limit || 10)
      .skip(args.pageNo > 1 ? (args.limit || 10) * (args.pageNo - 1) : 0)

    if (!getAllListing.length) return _r.error({ req, res, code: 400, message: 'Offerings not found' })

    // Add the 'address' field to each listing by looking it up in the business map
    const listingsWithAddress = getAllListing.map(listing => {
      const business = businessMap.get(listing.fkBusinessId.toString())
      return {
        ...listing._doc,
        address: business ? business.address : null
      }
    })

    _r.success({ req, res, code: 200, payload: { total: getAllListingCount, listings: listingsWithAddress } })
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
module.exports.searchListings = async (req, res) => {
  try {
    const { args } = req.bind
    const searchQuery = new RegExp(args.searchQuery, 'i')

    let businessFilter = {
      isPublic: true,
      isApproved: true,
      $or: [
        { tags: searchQuery },
        { category: searchQuery },
        { subCategories: searchQuery },
        { businessName: searchQuery }
      ]
    }

    if (args.city !== 'All Over India') businessFilter.city = args.city

    const businesses = await Business.find(businessFilter)

    const businessIds = businesses.map(business => business._id)

    // Create a map of business data for efficient lookup by fkBusinessId
    const businessMap = new Map()
    businesses.forEach(business => {
      businessMap.set(business._id.toString(), business)
    })

    let sort = {}

    if (args.filter === 'Date, new to old') sort.createdAt = -1

    if (args.filter === 'Date, old to new') sort.createdAt = 1

    if (args.filter === 'Alphabetically A-Z') sort.listingName = 1

    if (args.filter === 'Alphabetically Z-A') sort.listingName = -1

    const getAllSearchedListingsCount = await Listing.count({
      // fkBusinessId: { $in: businessIds },
      // listingName: searchQuery,
      isActive: true,
      isPublic: true,
      isApproved: true,
      $or: [
        {
          fkBusinessId: { $in: businessIds },
          listingName: searchQuery
        },
        {
          fkBusinessId: { $in: businessIds }
        }
        // { listingName: searchQuery },
        // { category: searchQuery },
        // { subCategory: searchQuery },
        // { businessName: searchQuery }
      ]
    })

    const getAllSearchedListings = await Listing.find({
      // fkBusinessId: { $in: businessIds },
      // listingName: searchQuery,
      isActive: true,
      isPublic: true,
      isApproved: true,
      $or: [
        {
          fkBusinessId: { $in: businessIds },
          listingName: searchQuery
        },
        {
          fkBusinessId: { $in: businessIds }
        }
        // { listingName: searchQuery },
        // { category: searchQuery },
        // { subCategory: searchQuery },
        // { businessName: searchQuery }
      ]
    })
      .sort(sort)
      .limit(args.limit || 10)
      .skip(args.pageNo > 1 ? (args.limit || 10) * (args.pageNo - 1) : 0)

    if (!getAllSearchedListings.length) return _r.error({ req, res, code: 400, message: 'Offerings not found' })

    // Add the 'address' field to each listing by looking it up in the business map
    const searchedListingsWithAddress = getAllSearchedListings.map(listing => {
      const business = businessMap.get(listing.fkBusinessId.toString())
      return {
        ...listing._doc,
        address: business ? business.address : null
      }
    })

    _r.success({
      req,
      res,
      code: 200,
      payload: { total: getAllSearchedListingsCount, listings: searchedListingsWithAddress }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} id
 */
module.exports.fetch = async (req, res) => {
  try {
    const { args } = req.bind

    let getListing = await Listing.findById(args.id, '-isBlocked -isApproved -updatedAt -__v -leads -views')

    if (!getListing) return _r.error({ req, res, code: 400, message: 'Offering not found' })

    if (!getListing.isPublic) return _r.error({ req, res, code: 400, message: 'Offering not found' })

    if (!getListing.isActive) return _r.error({ req, res, code: 400, message: 'Private Offering' })

    if (getListing.isBlocked) return _r.error({ req, res, code: 400, message: 'Offering is Blocked' })

    // Find the associated business by fkBusinessId
    const business = await Business.findById(getListing.fkBusinessId)

    // If the business is found, add its address to the listing
    if (business) {
      // getListing.address = business.address
      getListing = {
        ...getListing._doc,
        address: business ? business.address : null
      }
    } else {
      getListing.address = null // Set address to null if business is not found
    }

    _r.success({ req, res, code: 200, payload: { getListing } })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} id
 */
module.exports.fetchBusinessListings = async (req, res) => {
  try {
    const { args } = req.bind

    let getBusinessListings = await Listing.find(
      { fkBusinessId: args.id, isActive: true, isPublic: true, isApproved: true },
      '_id images listingName'
    )

    if (!getBusinessListings) return _r.error({ req, res, code: 400, message: 'Offerings not found' })

    _r.success({ req, res, code: 200, payload: { getBusinessListings } })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} fkListingId
 */

module.exports.updateViews = async (req, res) => {
  try {
    const { args } = req.bind

    const getListing = await Listing.findById(args.fkListingId)

    if (!getListing) return _r.error({ req, res, code: 400, message: 'Listing not found' })

    const updateListingViews = await Listing.findByIdAndUpdate(
      args.fkListingId,
      { $set: { views: getListing.views + 1 } },
      { new: true }
    )
    if (!updateListingViews) return _r.error({ req, res, code: 400, message: 'Listing not found' })

    _r.success({ req, res, code: 201, message: 'Views updated successfully' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
