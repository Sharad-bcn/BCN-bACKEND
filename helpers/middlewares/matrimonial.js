const { _r, _env } = require('express-tools');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { User, ActiveUsers, ActiveAdmins, Admin } = require('../../models');
const JWT_SECRET = _env('JWT_SECRET');
const BACKEND_ACCESS_KEY = _env('BACKEND_ACCESS_KEY');
// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// Multer configuration: support PDFs and images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir), // Directory to save uploaded files
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPEG, and PNG files are allowed!'));
    }
  },
});
// Middleware to check if the user is authorized for matrimonial services
module.exports.fetchMatrimonialUser = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) throw new Error('Unauthorized - Authorization header required!');
    // Check if user is logged in
    const isUserLoggedIn = await ActiveUsers.findOne({ token: authorizationHeader });
    if (!isUserLoggedIn) throw new Error('Unauthorized - Invalid session!');
    // Verify JWT token
    const data = jwt.verify(authorizationHeader, JWT_SECRET);
    const currentUser = await User.findById(data.user.id, '-pin');
    if (!currentUser) throw new Error('Unauthorized - User not found!');
    if (currentUser.isBlocked) throw new Error('Account is blocked!');
    // Validate subscription plan
    if (new Date() >= currentUser.planExpiresAt) {
      await User.findByIdAndUpdate(data.user.id, { $set: { plan: 'Plan 0' } });
      return _r.error({ req, res, code: 403, message: 'Subscription expired! Renew your plan.' });
    }
    req.bind = req.bind || {};
    req.bind.user = currentUser;
    next();
  } catch (error) {
    handleTokenError(req, res, error, ActiveUsers);
  }
};
// Middleware to check if the admin is authorized for matrimonial services
module.exports.fetchMatrimonialAdmin = async (req, res, next) => {
  try {
    const authenticationHeader = req.headers.authentication;
    if (!authenticationHeader) throw new Error('Unauthorized - Authentication header required!');
    const isAdminLoggedIn = await ActiveAdmins.findOne({ token: authenticationHeader });
    if (!isAdminLoggedIn) throw new Error('Unauthorized - Invalid session!');
    const data = jwt.verify(authenticationHeader, JWT_SECRET);
    const currentAdmin = await Admin.findById(data.admin.id, '-pin');
    if (!currentAdmin) throw new Error('Unauthorized - Admin not found!');
    req.bind = req.bind || {};
    req.bind.admin = currentAdmin;
    next();
  } catch (error) {
    handleTokenError(req, res, error, ActiveAdmins);
  }
};
// Error handler for expired or invalid JWT tokens
async function handleTokenError(req, res, error, activeSessionModel) {
  if (error.name === 'TokenExpiredError' || error.message === 'jwt expired') {
    try {
      const tokenHeader = req.headers.authorization || req.headers.authentication;
      const session = await activeSessionModel.findOne({ token: tokenHeader });
      if (session) {
        await activeSessionModel.deleteOne({ _id: session._id });
        console.log('Token expired, user/admin logged out');
      }
    } catch (cleanupError) {
      console.error('Error while cleaning up expired session:', cleanupError);
    }
    return _r.error({ req, res, httpCode: 401, message: 'Session expired! Please log in again.' });
  }
  return _r.error({ req, res, httpCode: 401, message: error.message });
}
// Middleware for file uploads
module.exports.upload = upload;






