const { _r, _env } = require('express-tools')
const jwt = require('jsonwebtoken')
const { User, ActiveUsers, ActiveAdmins, Admin } = require('../../models')
const JWT_SECRET = _env('JWT_SECRET')
const BACKEND_ACCESS_KEY = _env('BACKEND_ACCESS_KEY')

module.exports.fetchUser = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization
    if (!authorizationHeader) throw new Error('UnAuthorized - Authorization required!')

    const isUserLoggedIn = await ActiveUsers.findOne({ token: authorizationHeader })

    if (!isUserLoggedIn) throw new Error('UnAuthorized - Authorization required!')

    const data = jwt.verify(authorizationHeader, JWT_SECRET)
    const currentUser = await User.findById(data.user.id, '-pin')

    if (!currentUser) throw new Error('UnAuthorized - Authorization required!')
    if (currentUser.isBlocked) throw new Error('Account blocked!')

    if (new Date() >= currentUser.planExpiresAt) {
      let updateUserPlan = await User.findByIdAndUpdate(
        data.user.id,
        { $set: { plan: 'Plan 0' } },
        {
          lean: true
        }
      )

      if (!updateUserPlan) return _r.error({ req, res, code: 400, message: 'User not found' })
    }

    req.bind.user = data.user

    next()
  } catch (error) {
    // if (error.name !== 'TokenExpiredError' || error.name !== 'jwt expired') {
    //   console.log(error)
    // }

    if (error.name === 'TokenExpiredError' || error.name === 'jwt expired') {
      try {
        const isUserLoggedIn = await ActiveUsers.findOne({ token: req.headers.authorization })

        if (isUserLoggedIn) {
          const expireToken = await ActiveUsers.deleteOne({ _id: isUserLoggedIn.id })
          console.log('Token expired, user logged out')
        }
      } catch (err) {
        console.error('Error while updating active user status:', err)
      }

      return _r.error({ req, res, httpCode: 401, error, payload: { error: 'token expired' } })
    }
    _r.error({ req, res, httpCode: 401, error })
  }
}

module.exports.fetchAdmin = async (req, res, next) => {
  try {
    const authenticationHeader = req.headers.authentication
    if (!authenticationHeader) throw new Error('UnAuthorized - Authorization required!')

    const isAdminLoggedIn = await ActiveAdmins.findOne({ token: authenticationHeader })

    if (!isAdminLoggedIn) throw new Error('UnAuthorized - Authorization required!')

    const data = jwt.verify(authenticationHeader, JWT_SECRET)
    const currentAdmin = await Admin.findById(data.admin.id, '-pin')

    if (!currentAdmin) throw new Error('UnAuthorized - Authorization required!')

    req.bind.admin = data.admin

    next()
  } catch (error) {
    // if (error.name !== 'TokenExpiredError' || error.name !== 'jwt expired') {
    //   console.log(error)
    // }

    if (error.name === 'TokenExpiredError' || error.name === 'jwt expired') {
      try {
        const isAdminLoggedIn = await ActiveAdmins.findOne({ token: req.headers.authentication })

        if (isAdminLoggedIn) {
          const expireToken = await ActiveAdmins.deleteOne({ _id: isAdminLoggedIn.id })
          console.log('Token expired, admin logged out')
        }
      } catch (err) {
        console.error('Error while updating active admin status:', err)
      }

      return _r.error({ req, res, httpCode: 401, error, payload: { error: 'token expired' } })
    }
    _r.error({ req, res, httpCode: 401, error })
  }
}

module.exports.checkOrigin = async (req, res, next) => {
  try {
    const allowedHosts = [
      // 'http://localhost:5004',
      // 'http://localhost:5003',
      'http://localhost:8001',
      'https://admin-dev.bcnindia.com',
      'https://admin.bcnindia.com',
      'https://dev.bcnindia.com',
      'https://bcnindia.com',
      'https://www.bcnindia.com',
      'https://admin-test.bcnindia.com',
      'https://test.bcnindia.com'
    ]
    const origin = req.get('origin')
    const backendaccesskey = req.get('Backendaccesskey')

    if (!backendaccesskey) throw new Error('Forbidden: Access denied for this host')
    if (allowedHosts.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin)
      if (BACKEND_ACCESS_KEY === backendaccesskey) next()
    } else {
      throw new Error('Forbidden: Access denied for this host')
    }
  } catch (error) {
    _r.error({ req, res, code: 403, error })
  }
}
