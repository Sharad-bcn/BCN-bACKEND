const { _r } = require('express-tools')
const { Business } = require('../../../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

/**
 * @argument {ObjectId} id
 * @argument {Boolean} isApproved
 * @argument {String} rejectionMessage
 */
module.exports.updateApprovalStatus = async (req, res) => {
  try {
    const { args } = req.bind

    const fetchBusiness = await Business.findOne({ _id: args.id, isPublic: true, approvalStatus: 'Pending' })

    if (!fetchBusiness) return _r.error({ req, res, code: 400, message: 'Business not found' })

    if (fetchBusiness.isApproved) return _r.error({ req, res, code: 400, message: 'Business Already Approved' })

    const updateBusiness = await Business.findByIdAndUpdate(
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

    if (!updateBusiness) return _r.error({ req, res, code: 400, message: 'Business not found' })

    _r.success({
      req,
      res,
      code: 201,
      message:
        updateBusiness.businessName + (updateBusiness.isApproved ? ' approved successfully' : ' approval rejected')
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

    const getBusinessesCount = await Business.count({ isPublic: true, isApproved: false, approvalStatus: 'Pending' })

    const getBusinesses = await Business.find(
      { isPublic: true, isApproved: false, approvalStatus: 'Pending' },
      'businessName description website address facebookLink instagramLink images tags updatedAt category subCategory state city phoneNo fkUserId',
      {
        lean: true
      }
    )
      .sort({ updatedAt: -1 })
      .limit(args.perPage || 10)
      .skip(args.pageNo > 1 ? (args.perPage || 10) * (args.pageNo - 1) : 0)

    if (!getBusinesses) return _r.error({ req, res, code: 400, message: 'Businesses not found' })

    _r.success({
      req,
      res,
      code: 200,
      payload: {
        total: getBusinessesCount,
        Businesses: getBusinesses
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
/**
 * @argument {ObjectId} userId
 */
module.exports.checkUserBusiness = async (req, res) => {
  try {
    console.log('Authorization Header:', req.headers.authorization);
    console.log('Backend Access Key:', req.get('Backendaccesskey'));

    const { args } = req.bind

    // Query to find businesses linked to the user
    const userBusiness = await Business.findOne({ fkUserId: args.userId });

    if (!userBusiness) {
      return _r.success({
        req,
        res,
        code: 200,
        message: 'User has no business.',
        payload: { hasBusiness: false }
      });
    }

    _r.success({
      req,
      res,
      code: 200,
      message: 'User has a business.',
      payload: { hasBusiness: true, business: userBusiness }
    });
  } catch (error) {
    _r.error({ req, res, error });
  }
};