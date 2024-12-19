// const { $express } = require('express-tools');
// const upload = require('../../../helpers/middlewares/matrimonial');
// const { matrimonialValidator, searchValidator, handleValidationErrors } = require('./validator');
// const { saveMatrimonial, searchMatrimonial, uploadPdf } = require('./controller');

// // Create the router using $express.Router()
// const $router = $express.Router();

// // POST route to save matrimonial data
// $router.post('/save', upload.single('photo'), matrimonialValidator, handleValidationErrors, saveMatrimonial);

// // GET route to search matrimonial data
// $router.get('/search', searchValidator, handleValidationErrors, searchMatrimonial);

// // POST route to upload a PDF
// $router.post('/upload-pdf', upload.single('pdf'), uploadPdf); // Change 'photo' to 'pdf' for PDF upload

// // Export the router
// module.exports = $router;
/*const { _validate } = require('express-tools');
const validator = require('./validator');
const controller = require('./controller');
module.exports = (app) => {
  app.post('/matrimonial/save', validator.save, controller.saveMatrimonial);
  app.post('/matrimonial/upload-pdf', validator.uploadPDF, controller.uploadPDF);
  app.get('/matrimonial/search', validator.search, controller.searchMatrimonial);
};
*/
const { _validate } = require('express-tools'); // Custom validation library
const validator = require('./validator'); // Validator rules for fields
const controller = require('./controller'); // Controller with logic
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Ensure the upload directory exists
const uploadPath = path.join(__dirname, '../uploads/');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Upload directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept PDFs or image files
    } else {
      cb(new Error('Only PDF or image files are allowed!')); // Reject invalid files
    }
  },
});
module.exports = (app) => {
  /**
   * POST - Save matrimonial form data
   */
  app.post(
    '/matrimonial/save',
    upload.fields([
      { name: 'photo', maxCount: 1 }, // Accept one image file for photo
      { name: 'cv', maxCount: 1 }, // Accept one PDF file for CV
    ]),
    _validate(validator.save), // Validation middleware
    controller.saveMatrimonial
  );
  /**
   * POST - Upload PDF or photo
   */
  app.post(
    '/matrimonial/upload-file',
    upload.single('file'), // Single file upload
    _validate(validator.uploadFile), // Validation middleware
    controller.uploadFile
  );
  /**
   * GET - Search matrimonial profiles
   */
  app.get(
    '/matrimonial/search',
    _validate(validator.search), // Validation middleware for search
    controller.searchMatrimonial
  );
  /**
   * Global Error Handler
   */
  app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ message: `File upload error: ${err.message}` });
    }
    if (err.message === 'Only PDF or image files are allowed!') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({
      message: 'Something went wrong!',
      error: err.message,
    });
  });
};