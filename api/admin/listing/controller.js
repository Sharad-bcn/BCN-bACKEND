const { _r } = require('express-tools')
const { Listing } = require('../../../models')

/**
 * @argument {ObjectId} id
 * @argument {Boolean} isApproved
 * @argument {String} rejectionMessage
 */
module.exports.updateApprovalStatus = async (req, res) => {
  try {
    const { args } = req.bind

    const fetchListing = await Listing.findOne({ _id: args.id, isPublic: true, approvalStatus: 'Pending' })

    if (!fetchListing) return _r.error({ req, res, code: 400, message: 'Offering not found' })

    if (fetchListing.isApproved) return _r.error({ req, res, code: 400, message: 'Offering Already Approved' })

    const updateListing = await Listing.findByIdAndUpdate(
      args.id,
      {
        $set: {
          isApproved: args.isApproved,
          approvalStatus: args.isApproved ? 'Approved' : 'Rejected',
          rejectionMessage: args.isApproved ? '' : args.rejectionMessage
        }
      },
      { new: true }
    )

    if (!updateListing) return _r.error({ req, res, code: 400, message: 'Offering not found' })

    _r.success({
      req,
      res,
      code: 201,
      message: updateListing.listingName + (updateListing.isApproved ? ' approved successfully' : ' approval rejected')
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {Number} perPage
 * @argument {Number} pageNo
 */
module.exports.fetchNewlyCreated = async (req, res) => {
  try {
    const { args } = req.bind

    const getListingsCount = await Listing.count({ isPublic: true, isApproved: false, approvalStatus: 'Pending' })

    const getListings = await Listing.find(
      { isPublic: true, isApproved: false, approvalStatus: 'Pending' },
      'description contactPerson images updatedAt listingName subCategory category phoneNo fkUserId fkBusinessId',
      {
        lean: true
      }
    )
      .sort({ updatedAt: -1 })
      .limit(args.perPage || 10)
      .skip(args.pageNo > 1 ? (args.perPage || 10) * (args.pageNo - 1) : 0)

    if (!getListings) return _r.error({ req, res, code: 400, message: 'Offerings not found' })

    _r.success({
      req,
      res,
      code: 200,
      payload: {
        total: getListingsCount,
        Listings: getListings
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
