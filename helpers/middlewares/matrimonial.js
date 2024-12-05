const { _r, _env } = require('express-tools');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { User, ActiveUsers, ActiveAdmins, Admin } = require('../../models');

const JWT_SECRET = _env('JWT_SECRET');
const BACKEND_ACCESS_KEY = _env('BACKEND_ACCESS_KEY');

// Upload directory setup
const uploadDir = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir), // Directory to save uploaded files
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
    cb(null, uniqueSuffix); // Save with a unique filename
  },
});

// Multer setup for file uploads (only PDFs allowed)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'));
    }
  },
});

// Middleware to check if the user is authorized for matrimonial services
module.exports.fetchMatrimonialUser = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) throw new Error('UnAuthorized - Authorization required!');

    // Check if user is logged in
    const isUserLoggedIn = await ActiveUsers.findOne({ token: authorizationHeader });
    if (!isUserLoggedIn) throw new Error('UnAuthorized - Authorization required!');

    // Verify the JWT token
    const data = jwt.verify(authorizationHeader, JWT_SECRET);
    const currentUser = await User.findById(data.user.id, '-pin');
    if (!currentUser) throw new Error('UnAuthorized - Authorization required!');
    if (currentUser.isBlocked) throw new Error('Account blocked!');

    // Validate subscription plan
    if (new Date() >= currentUser.planExpiresAt) {
      let updateUserPlan = await User.findByIdAndUpdate(data.user.id, { $set: { plan: 'Plan 0' } }, { lean: true });
      if (!updateUserPlan) return _r.error({ req, res, code: 400, message: 'User not found' });
    }

    req.bind.user = data.user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'jwt expired') {
      try {
        const isUserLoggedIn = await ActiveUsers.findOne({ token: req.headers.authorization });
        if (isUserLoggedIn) {
          await ActiveUsers.deleteOne({ _id: isUserLoggedIn.id });
          console.log('Token expired, user logged out');
        }
      } catch (err) {
        console.error('Error while updating active user status:', err);
      }
      return _r.error({ req, res, httpCode: 401, error, payload: { error: 'token expired' } });
    }
    _r.error({ req, res, httpCode: 401, error });
  }
};

// Middleware to check if the admin is authorized for matrimonial services
module.exports.fetchMatrimonialAdmin = async (req, res, next) => {
  try {
    const authenticationHeader = req.headers.authentication;
    if (!authenticationHeader) throw new Error('UnAuthorized - Authorization required!');

    const isAdminLoggedIn = await ActiveAdmins.findOne({ token: authenticationHeader });
    if (!isAdminLoggedIn) throw new Error('UnAuthorized - Authorization required!');

    const data = jwt.verify(authenticationHeader, JWT_SECRET);
    const currentAdmin = await Admin.findById(data.admin.id, '-pin');
    if (!currentAdmin) throw new Error('UnAuthorized - Authorization required!');
    req.bind.admin = data.admin;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'jwt expired') {
      try {
        const isAdminLoggedIn = await ActiveAdmins.findOne({ token: req.headers.authentication });
        if (isAdminLoggedIn) {
          await ActiveAdmins.deleteOne({ _id: isAdminLoggedIn.id });
          console.log('Token expired, admin logged out');
        }
      } catch (err) {
        console.error('Error while updating active admin status:', err);
      }
      return _r.error({ req, res, httpCode: 401, error, payload: { error: 'token expired' } });
    }
    _r.error({ req, res, httpCode: 401, error });
  }
};

// Middleware to handle file uploads
module.exports.upload = upload;
