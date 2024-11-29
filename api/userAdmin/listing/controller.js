const { _r } = require('express-tools')
const { Listing, Business, Leads, User } = require('../../../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

/**
 * @argument {String} listingName
 * @argument {Array.<String>} images
 * @argument {String} description
 * @argument {String} contactPerson
 * @argument {Number} phoneNo
 * @argument {ObjectId} fkUserId
 * @argument {ObjectId} fkBusinessId
 */

module.exports.create = async (req, res) => {
  try {
    let { args } = req.bind
    args.fkUserId = req.bind.user.id

    const listingsCount = await Listing.count({
      fkUserId: args.fkUserId,
      fkBusinessId: args.fkBusinessId,
      isPublic: true
    })

    if (listingsCount >= 6) return _r.error({ req, res, code: 400, message: 'Max 6 Offerings allowed' })

    const alreadyExists = await Listing.findOne({
      fkUserId: args.fkUserId,
      fkBusinessId: args.fkBusinessId,
      listingName: args.listingName,
      isPublic: true
    })

    if (alreadyExists) return _r.error({ req, res, code: 400, message: 'Offering already exists' })

    const getBusiness = await Business.findById(args.fkBusinessId)

    if (!getBusiness) return _r.error({ req, res, code: 400, message: 'Business not found' })

    args.category = getBusiness.category
    args.subCategories = getBusiness.subCategories
    args.businessName = getBusiness.businessName

    let newListing = await Listing.create({ ...args })

    _r.success({ req, res, code: 201, message: 'Offering created successfully', payload: { listingsCount } })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {String} listingName
 * @argument {Array.<String>} images
 * @argument {String} description
 * @argument {String} contactPerson
 * @argument {Number} phoneNo
 * @argument {ObjectId} fkUserId
 * @argument {String} businessName
 * @argument {ObjectId} fkBusinessId
 * @argument {Boolean} isActive
 */

module.exports.update = async (req, res) => {
  try {
    let { args } = req.bind

    const getBusiness = await Business.findById(args.fkBusinessId)

    if (!getBusiness) return _r.error({ req, res, code: 400, message: 'Business not found' })

    args.category = getBusiness.category
    args.subCategories = getBusiness.subCategories

    const getListing = await Listing.findOne({ _id: args.id, isPublic: true })

    if (!getListing) return _r.error({ req, res, code: 400, message: 'Offering not found' })

    const updateListing = await Listing.findByIdAndUpdate(
      args.id,
      { $set: { ...args, isApproved: false, approvalStatus: 'Pending', rejectionMessage: '' } },
      { new: true }
    )

    if (!updateListing) return _r.error({ req, res, code: 400, message: 'Offering not found' })

    _r.success({ req, res, code: 201, message: updateListing.listingName + ' updated successfully', payload: {} })
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

    let getListing = await Listing.findOne({ _id: args.id, isPublic: true })

    if (!getListing) return _r.error({ req, res, code: 400, message: 'Offering not found' })

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
 * @argument {Number} perPage
 * @argument {Number} pageNo
 * @argument {String} filter
 * @argument {String} searchQuery
 * @argument {String} fkBusinessId
 */
module.exports.fetchAll = async (req, res) => {
  try {
    const { args } = req.bind
    let fkUserId = req.bind.user.id
    let searchFilter = {}
    const searchQuery = new RegExp(args.searchQuery, 'i')

    searchFilter.listingName = searchQuery
    searchFilter.fkUserId = fkUserId
    searchFilter.isPublic = true
    searchFilter.fkBusinessId = args.fkBusinessId
    if (args.filter === 'Active') {
      searchFilter.isActive = true
      searchFilter.isApproved = true
    }
    if (args.filter === 'InActive') {
      searchFilter.isActive = false
      searchFilter.isApproved = true
    }
    if (args.filter === 'Pending') searchFilter.isApproved = false

    const getAllListingCount = await Listing.count(searchFilter)

    const getAllListing = await Listing.find(searchFilter)
      .sort({ createdAt: -1 })
      .limit(args.perPage || 10)
      .skip(args.pageNo > 1 ? (args.perPage || 10) * (args.pageNo - 1) : 0)

    if (!getAllListing.length) {
      return _r.error({ req, res, code: 400, message: 'Offerings not found' })
    }

    // Extract an array of fkBusinessId values from the listings
    const fkBusinessIds = getAllListing.map(listing => listing.fkBusinessId)

    // Find businesses based on the array of fkBusinessId values
    const businesses = await Business.find({ _id: { $in: fkBusinessIds } })

    // Create a map of business data for efficient lookup by fkBusinessId
    const businessMap = new Map()
    businesses.forEach(business => {
      businessMap.set(business._id.toString(), business)
    })

    // Fetch the count of leads for each listing
    const leadsCountMap = new Map()
    for (let i = 0; i < getAllListing.length; i++) {
      const listingId = getAllListing[i]._id
      const leadCount = await Leads.count({ fkListingId: listingId })
      leadsCountMap.set(listingId.toString(), leadCount)
    }

    // Add the 'leads' field to each listing with the corresponding leads count
    const listingsWithLeadsCountAndAddress = getAllListing.map(listing => {
      const listingIdString = listing._id.toString()
      const business = businessMap.get(listing.fkBusinessId.toString())

      return {
        ...listing._doc,
        leads: leadsCountMap.get(listingIdString) || 0,
        address: business ? business.address : null
      }
    })

    _r.success({
      req,
      res,
      code: 200,
      payload: { total: getAllListingCount, listings: listingsWithLeadsCountAndAddress }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} id
 */
module.exports.delete = async (req, res) => {
  try {
    const { args } = req.bind

    const existingListing = await Listing.findOne({ _id: args.id, isPublic: true })

    if (!existingListing) return _r.error({ req, res, code: 400, message: 'Offering not found' })

    const deleteListing = await Listing.findByIdAndUpdate(args.id, {
      deletedAt: Date.now(),
      isPublic: false
    })

    if (!deleteListing) return _r.error({ req, res, code: 400, message: 'Offering not found' })

    _r.success({ req, res, code: 200, message: existingListing.listingName + ' deleted successfully', payload: {} })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} id
 */
module.exports.toggleListingStatus = async (req, res) => {
  try {
    const { args } = req.bind

    const listing = await Listing.findOne({ _id: args.id, isPublic: true })

    if (!listing) return _r.error({ req, res, code: 400, message: 'Offering not found' })

    const updateListingStatus = await Listing.findByIdAndUpdate(
      args.id,
      { $set: { isActive: !listing.isActive } },
      { new: true }
    )

    if (!updateListingStatus) return _r.error({ req, res, code: 400, message: 'Offering not found' })

    _r.success({
      req,
      res,
      code: 201,
      message: 'Offering updated successfully',
      payload: { status: !listing.isActive }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} fkUserId
 * @argument {ObjectId} fkBusinessId
 */
module.exports.fetchListingsCount = async (req, res) => {
  try {
    const { args } = req.bind
    args.fkUserId = req.bind.user.id

    const listingsCount = await Listing.count({
      fkUserId: args.fkUserId,
      fkBusinessId: args.fkBusinessId,
      isPublic: true
    })

    _r.success({
      req,
      res,
      code: 201,
      payload: { listingsCount }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} fkUserId
 */
module.exports.fetchListingPrefilledData = async (req, res) => {
  try {
    // const { args } = req.bind

    const getListingPrefilledData = await User.findById(req.bind.user.id, 'phoneNo lastName firstName')

    if (!getListingPrefilledData) return _r.error({ req, res, code: 400, message: 'Prefilled data not found' })

    _r.success({
      req,
      res,
      code: 201,
      payload: { listingPrefilledData: getListingPrefilledData }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
