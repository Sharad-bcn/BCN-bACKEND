const AWS = require('aws-sdk');

// Configure AWS with environment variables
const s3Config = {
  accessKeyId: process.env.REACT_APP_S3_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_S3_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_S3_REGION
};

// Initialize AWS with config
AWS.config.update(s3Config);

// Create S3 instance
const s3 = new AWS.S3();

/**
 * Upload file to S3
 * @param {Object} file - The file object from express-fileupload
 * @param {string} folder - The folder name in S3 bucket
 * @returns {Promise<Object>} - Returns upload result with Location URL
 */
const uploadFile = async (file, folder = 'general') => {
  try {
    // Validate inputs
    if (!file || !file.name || !file.data) {
      throw new Error('Invalid file object');
    }

    // Create safe filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${folder}/${timestamp}-${safeName}`;

    // Set up upload parameters
    const params = {
      Bucket: process.env.REACT_APP_S3_BUCKET,
      Key: fileName,
      Body: file.data,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    // Log upload attempt (optional, for debugging)
    console.log('Attempting S3 upload:', {
      bucket: process.env.REACT_APP_S3_BUCKET,
      key: fileName,
      contentType: file.mimetype
    });

    // Perform upload
    const uploadResult = await s3.upload(params).promise();

    // Construct final URL using bucket location
    const fileUrl = `${process.env.REACT_APP_S3_BUCKET_LOCATION}/${fileName}`;

    return {
      ...uploadResult,
      Location: fileUrl
    };

  } catch (error) {
    // Log error details
    console.error('S3 upload error:', {
      error: error.message,
      stack: error.stack,
      file: file?.name
    });

    // Rethrow error for handling in controller
    throw new Error(`File upload failed: ${error.message}`);
  }
};

// Export the upload function
module.exports = {
  uploadFile
};