const { _r } = require('express-tools')
const { Business, Listing, BusinessLeads, User } = require('../../../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

/**
 * @argument {Array.<String>} tags
 * @argument {Array.<String>} images
 * @argument {String} businessName
 * @argument {String} description
 * @argument {Number} phoneNo
 * @argument {String} gst
 * @argument {String} website
 * @argument {ObjectId} fkUserId
 * @argument {String} category
 * @argument {Array.<String>} subCategories
 * @argument {String} address
 * @argument {String} state
 * @argument {String} city
 * @argument {Number} pinCode
 * @argument {String} facebookLink
 * @argument {String} instagramLink
 * @argument {String} dateOfEstablishment
 * @argument {Array.<Object>} workingHours
 * @argument {Object} location
 */

module.exports.create = async (req, res) => {
  try {
    const { args } = req.bind
    args.fkUserId = req.bind.user.id

    const businessCount = await Business.count({ fkUserId: args.fkUserId })

    if (businessCount >= 5) return _r.error({ req, res, code: 400, message: 'Max 5 Businesses allowed' })

    const alreadyExists = await Business.findOne({
      fkUserId: args.fkUserId,
      businessName: args.businessName,
      isPublic: true
    })

    if (alreadyExists) return _r.error({ req, res, code: 400, message: 'Business already registered' })

    let newBusiness = await Business.create({ ...args })

    _r.success({ req, res, code: 201, message: 'Business registered successfully' })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} id
 * @argument {Array.<String>} tags
 * @argument {Array.<String>} images
 * @argument {String} businessName
 * @argument {String} description
 * @argument {Number} phoneNo
 * @argument {String} gst
 * @argument {String} website
 * @argument {ObjectId} fkUserId
 * @argument {String} category
 * @argument {Array.<String>} subCategories
 * @argument {String} address
 * @argument {String} state
 * @argument {String} city
 * @argument {Number} pinCode
 * @argument {String} facebookLink
 * @argument {String} instagramLink
 * @argument {String} dateOfEstablishment
 * @argument {Array.<Object>} workingHours
 * @argument {Object} location
 */

module.exports.update = async (req, res) => {
  try {
    const { args } = req.bind

    const fetchBusiness = await Business.findOne({ _id: args.id, isPublic: true })

    if (!fetchBusiness) return _r.error({ req, res, code: 400, message: 'Business not found' })

    const updateBusiness = await Business.findByIdAndUpdate(
      args.id,
      { $set: { ...args, isApproved: false, approvalStatus: 'Pending', rejectionMessage: '' } },
      { new: true }
    )

    if (!updateBusiness) return _r.error({ req, res, code: 400, message: 'Business not found' })

    const businessListings = await Listing.find({ fkBusinessId: args.id, isPublic: true }).lean()

    if (businessListings.length) {
      const updateListingsCategoriesAndSubcategories = await Listing.updateMany(
        { _id: { $in: businessListings.map(x => x._id) } },
        { $set: { category: args.category, subCategories: args.subCategories } }
      )
    }

    _r.success({ req, res, code: 201, message: 'Business updated successfully', payload: {} })
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

    let getBusiness = await Business.findOne({ _id: args.id, isPublic: true }, '-__v -createdAt -updatedAt', {
      lean: true
    })

    if (!getBusiness) return _r.error({ req, res, code: 400, message: 'Business not found' })

    const listingsCount = await Listing.count({ fkBusinessId: args.id, isPublic: true })
    getBusiness.listingsCount = listingsCount

    if (getBusiness) {
      getBusiness.workingHours.timings = getBusiness.workingHours.timings.map(workingHour => {
        const { _id, ...rest } = workingHour // Exclude _id from workingHours object
        return rest
      })
    }

    _r.success({ req, res, code: 200, payload: { getBusiness } })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {Number} perPage
 * @argument {Number} pageNo
 * @argument {String} filter
 */
module.exports.fetchAll = async (req, res) => {
  try {
    const { args } = req.bind
    let fkUserId = req.bind.user.id
    let searchFilter = {}
    searchFilter.isPublic = true
    searchFilter.fkUserId = fkUserId

    if (args.filter === 'Active') searchFilter.isApproved = true
    if (args.filter === 'Pending') searchFilter.isApproved = false

    const getAllBusinessCount = await Business.count(searchFilter)

    let getAllBusiness = []

    if (args && args.perPage && args.pageNo) {
      getAllBusiness = await Business.find(searchFilter)
        .sort({ createdAt: -1 })
        .limit(args.perPage || 10)
        .skip(args.pageNo > 1 ? (args.perPage || 10) * (args.pageNo - 1) : 0)
    } else {
      getAllBusiness = await Business.find(searchFilter).sort({ createdAt: -1 })
    }

    if (!getAllBusiness.length) return _r.error({ req, res, code: 400, message: 'Businesses not found' })

    const businessIds = getAllBusiness.map(business => business._id)

    const listingsCountPerBusiness = await Listing.find({ fkBusinessId: { $in: businessIds }, isPublic: true })

    const leadsCountPerBusiness = await BusinessLeads.find({ fkBusinessId: { $in: businessIds }, isPublic: true })

    getAllBusiness = getAllBusiness.map(business => {
      const { _id, ...rest } = business.toObject() // Extract all fields except _id
      const listingsCount = listingsCountPerBusiness.filter(item => item.fkBusinessId.equals(_id)).length
      const leadsCount = leadsCountPerBusiness.filter(item => item.fkBusinessId.equals(_id)).length
      return { _id, ...rest, listingsCount, leadsCount }
    })

    _r.success({ req, res, code: 200, payload: { total: getAllBusinessCount, getAllBusiness } })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {ObjectId} fkUserId
 */
module.exports.fetchBusinessPrefilledData = async (req, res) => {
  try {
    // const { args } = req.bind

    const getBusinessPrefilledData = await User.findById(req.bind.user.id, 'phoneNo lastName firstName')

    if (!getBusinessPrefilledData) return _r.error({ req, res, code: 400, message: 'Prefilled data not found' })

    _r.success({
      req,
      res,
      code: 201,
      payload: { businessPrefilledData: getBusinessPrefilledData }
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
    const existingBusiness = await Business.findOne({ _id: args.id, isPublic: true })

    if (!existingBusiness) return _r.error({ req, res, code: 400, message: 'Business not found' })

    const deleteBusiness = await Business.findByIdAndUpdate(args.id, {
      deletedAt: Date.now(),
      isPublic: false
    })

    if (!deleteBusiness) return _r.error({ req, res, code: 400, message: 'Business not found' })

    const getBusinessListings = await Listing.find({ fkBusinessId: args.id, isPublic: true })

    if (getBusinessListings.length) {
      const filter = { _id: { $in: getBusinessListings.map(listing => listing._id) } }
      const update = {
        $set: {
          deletedAt: Date.now(),
          isPublic: false
        }
      }

      const deleteBusinessListings = await Listing.updateMany(filter, update)
    }

    _r.success({ req, res, code: 200, message: existingBusiness.businessName + ' deleted successfully', payload: {} })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
